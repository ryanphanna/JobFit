import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from "@google/generative-ai";
import { supabase } from "./supabase";
import type { JobAnalysis, ResumeProfile, ExperienceBlock } from "../types";
import { getSecureItem, setSecureItem, removeSecureItem, migrateToSecureStorage } from "../utils/secureStorage";
import { getUserFriendlyError, getRetryMessage } from "../utils/errorMessages";
import { API_CONFIG, CONTENT_VALIDATION, AI_MODELS, AI_TEMPERATURE, STORAGE_KEYS } from "../constants";
import { ANALYSIS_PROMPTS } from "../prompts/analysis";
import { PARSING_PROMPTS } from "../prompts/parsing";

// Callback type for retry progress
export type RetryProgressCallback = (message: string, attempt: number, maxAttempts: number) => void;

// Migrate old unencrypted API key to secure storage on first load
let migrationDone = false;
const migrateApiKeyIfNeeded = async () => {
    if (!migrationDone) {
        await migrateToSecureStorage('gemini_api_key', STORAGE_KEYS.API_KEY);
        migrationDone = true;
    }
};

const getApiKey = async (): Promise<string | null> => {
    await migrateApiKeyIfNeeded();
    return (await getSecureItem(STORAGE_KEYS.API_KEY)) || import.meta.env.VITE_API_KEY || null;
};

// Export functions for API key management
export const saveApiKey = async (key: string): Promise<void> => {
    await setSecureItem(STORAGE_KEYS.API_KEY, key);
};

export const clearApiKey = (): void => {
    removeSecureItem(STORAGE_KEYS.API_KEY);
};

// Helper: Get Model (Direct or Proxy)
const getModel = async (params: any) => {
    const key = await getApiKey();

    // 1. BYOK Mode (Direct to Google)
    if (key) {
        const genAI = new GoogleGenerativeAI(key);
        return genAI.getGenerativeModel(params);
    }

    // 2. Pro Mode (Proxy via Supabase)
    // Returns an object that mimics the `model` interface
    return {
        generateContent: async (payload: any) => {
            console.log("Using Gemini Proxy (Edge Function)...");

            // Construct request body for the Edge Function
            const { data, error } = await supabase.functions.invoke('gemini-proxy', {
                body: {
                    payload: payload,
                    modelName: params.model,
                    generationConfig: params.generationConfig
                }
            });

            if (error) throw new Error(`Proxy Error: ${error.message}`);
            if (data?.error) throw new Error(`AI Error: ${data.error}`);

            // Return compatible response object
            return {
                response: {
                    text: () => data.text
                }
            };
        }
    };
};

export const validateApiKey = async (key: string): Promise<{ isValid: boolean; error?: string }> => {
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: AI_MODELS.FLASH });
        await model.generateContent("Test");
        return { isValid: true };
    } catch (error: unknown) {
        //...
        const e = error as Error;

        // If Quota Exceeded (429), the key IS valid, just exhausted.
        // We should allow the user to save it.
        if (e.message && (e.message.includes("429") || e.message.includes("Quota") || e.message.includes("quota"))) {
            return { isValid: true, error: "High traffic. Please wait a moment." };
        }

        // Extract a friendly error message
        let errorMessage = "Invalid API Key. Please check and try again.";
        if (e.message) {
            if (e.message.includes("403")) errorMessage = "Permission denied. Check API key restrictions.";
            else if (e.message.includes("404")) errorMessage = "Model not found. Try a different key or region.";
            else if (e.message.includes("400")) errorMessage = "Invalid API Key format.";
            else errorMessage = `Validation failed: ${e.message}`;
        }
        return { isValid: false, error: errorMessage };
    }
}

// Helper for exponential backoff retries on 429 errors
// User requested more conservative polling and detailed error surfacing
const callWithRetry = async <T>(
    fn: () => Promise<T>,
    retries = API_CONFIG.MAX_RETRIES,
    initialDelay = API_CONFIG.INITIAL_RETRY_DELAY_MS,
    onProgress?: RetryProgressCallback
): Promise<T> => {
    let currentDelay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: unknown) {
            const err = error as Error;
            const errorMessage = err.message || '';

            // Check for specific quota violations
            const isDailyQuota = errorMessage.includes("PerDay");
            if (isDailyQuota) {
                // If we hit the daily limit, no point in retrying immediately
                const friendlyError = getUserFriendlyError("DAILY_QUOTA_EXCEEDED");
                throw new Error(friendlyError);
            }

            const isQuotaError = (
                errorMessage.includes("429") ||
                errorMessage.includes("Quota") ||
                errorMessage.includes("quota") ||
                errorMessage.includes("High traffic")
            );

            if (isQuotaError && i < retries - 1) {
                // Shared Quota/Traffic Jam - Retry with backoff
                const delaySeconds = currentDelay / 1000;
                const retryMsg = getRetryMessage(i + 1, retries, delaySeconds);
                console.log(retryMsg);

                // Notify UI of retry progress
                if (onProgress) {
                    onProgress(retryMsg, i + 1, retries);
                }

                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay = currentDelay * 2; // Exponential backoff (2s -> 4s -> 8s)
            } else {
                if (isQuotaError) {
                    const friendlyError = getUserFriendlyError("RATE_LIMIT_EXCEEDED");
                    throw new Error(friendlyError);
                }
                // Convert technical error to friendly message
                throw new Error(getUserFriendlyError(err));
            }
        }
    }
    throw new Error("Request failed after multiple attempts. Please try again later.");
};

// Helper to turn blocks back into a readable string for the AI
const stringifyProfile = (profile: ResumeProfile): string => {
    return profile.blocks
        .filter(b => b.isVisible)
        .map(b => {
            return `
BLOCK_ID: ${b.id}
ROLE: ${b.title}
ORG: ${b.organization}
DATE: ${b.dateRange}
DETAILS:
${b.bullets.map(bull => `- ${bull}`).join('\n')}
`;
        })
        .join('\n---\n');
};

export const analyzeJobFit = async (
    jobDescription: string,
    resumes: ResumeProfile[],
    onProgress?: RetryProgressCallback
): Promise<JobAnalysis> => {

    const resumeContext = resumes
        .map(r => `PROFILE_NAME: ${r.name}\nPROFILE_ID: ${r.id}\nEXPERIENCE BLOCKS:\n${stringifyProfile(r)}\n`)
        .join("\n=================\n");

    const prompt = ANALYSIS_PROMPTS.JOB_FIT_ANALYSIS(jobDescription, resumeContext);

    return callWithRetry(async () => {
        try {
            const model = await getModel({
                model: AI_MODELS.FLASH, // Use 2.0-flash for structured data extraction
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
            });
            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: AI_TEMPERATURE.STRICT,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            distilledJob: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    companyName: { type: SchemaType.STRING },
                                    roleTitle: { type: SchemaType.STRING },
                                    applicationDeadline: { type: SchemaType.STRING, nullable: true },
                                    keySkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                    coreResponsibilities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                },
                                required: ["companyName", "roleTitle", "keySkills", "coreResponsibilities"]
                            },
                            compatibilityScore: { type: SchemaType.INTEGER },
                            bestResumeProfileId: { type: SchemaType.STRING },
                            reasoning: { type: SchemaType.STRING },
                            strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            tailoringInstructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            recommendedBlockIds: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["compatibilityScore", "bestResumeProfileId", "reasoning", "strengths", "weaknesses", "tailoringInstructions", "distilledJob", "recommendedBlockIds"]
                    }
                }
            });

            const text = response.response.text();
            if (!text) throw new Error("No response from AI");

            // Increment local request counter on success
            const today = new Date().toISOString().split('T')[0];
            const currentCount = JSON.parse(localStorage.getItem('jobfit_daily_usage') || '{}');
            if (currentCount.date !== today) {
                currentCount.date = today;
                currentCount.count = 0;
            }
            currentCount.count++;
            localStorage.setItem('jobfit_daily_usage', JSON.stringify(currentCount));

            return JSON.parse(text) as JobAnalysis;

        } catch (error) {
            throw error; // Re-throw to trigger retry
        }
    }, 3, 2000, onProgress);
};


export const generateCoverLetter = async (
    jobDescription: string,
    selectedResume: ResumeProfile,
    tailoringInstructions: string[],
    additionalContext?: string
): Promise<{ text: string; promptVersion: string }> => {
    // ... (prompt definition) ...
    const resumeText = stringifyProfile(selectedResume);

    // Use extracted templates/prompts
    const PROMPT_VARIANTS = ANALYSIS_PROMPTS.COVER_LETTER.VARIANTS;

    // A/B Test Selection (Random)
    const keys = Object.keys(PROMPT_VARIANTS);
    const promptVersion = keys[Math.floor(Math.random() * keys.length)];
    const selectedVariantTemplate = PROMPT_VARIANTS[promptVersion as keyof typeof PROMPT_VARIANTS];
    const selectedModel = promptVersion === 'v3_experimental_pro' ? AI_MODELS.PRO : AI_MODELS.FLASH;

    const prompt = ANALYSIS_PROMPTS.COVER_LETTER.GENERATE(
        selectedVariantTemplate,
        jobDescription,
        resumeText,
        tailoringInstructions,
        additionalContext
    );

    return callWithRetry(async () => {
        try {
            const model = await getModel({
                model: selectedModel,
            });
            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });
            const text = response.response.text() || "Could not generate cover letter.";
            return { text, promptVersion };
        } catch (error) {
            throw error;
        }
    });
};

export const generateTailoredSummary = async (
    jobDescription: string,
    resumes: ResumeProfile[],
): Promise<string> => {

    const resumeContext = resumes
        .map(r => `PROFILE_NAME: ${r.name}\n${stringifyProfile(r)}`)
        .join("\n---\n");

    const prompt = ANALYSIS_PROMPTS.TAILORED_SUMMARY(jobDescription, resumeContext);

    return callWithRetry(async () => {
        try {
            const model = await getModel({
                model: 'gemini-2.0-flash', // Use 2.0 Flash for high-quality cover letter writing
            });
            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });
            return response.response.text() || "Experienced professional with relevant skills.";
        } catch (error) {
            throw error;
        }
    });
};

export const critiqueCoverLetter = async (
    jobDescription: string,
    coverLetter: string
): Promise<{ score: number; decision: 'interview' | 'reject' | 'maybe'; feedback: string[]; strengths: string[] }> => {

    const prompt = ANALYSIS_PROMPTS.CRITIQUE_COVER_LETTER(jobDescription, coverLetter);

    return callWithRetry(async () => {
        try {
            const model = await getModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature: AI_TEMPERATURE.STRICT,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.INTEGER },
                            decision: { type: SchemaType.STRING, enum: ["interview", "reject", "maybe"], format: "enum" },
                            strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            feedback: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["score", "decision", "strengths", "feedback"]
                    }
                }
            });

            const response = await model.generateContent(prompt);
            const text = response.response.text();
            if (!text) throw new Error("No response");
            return JSON.parse(text);
        } catch (error) {
            throw error;
        }
    });
};

// Helper to extract text from PDF (Client Side) to avoid 6MB payload limit
const extractPdfText = async (base64: string): Promise<string> => {
    try {
        // Use global PDF.js from CDN
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
            console.error("PDF.js library not found on window");
            return "";
        };

        const loadingTask = pdfjsLib.getDocument({ data: atob(base64) });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    } catch (e) {
        console.warn("Client-side PDF extraction failed", e);
        return "";
    }
}

// New function to parse PDF/Image into structured blocks
export const parseResumeFile = async (
    fileBase64: string,
    mimeType: string
): Promise<ExperienceBlock[]> => {

    // 1. Optimize Payload: Process PDF client-side if possible
    let promptParts: any[] = [];

    if (mimeType === 'application/pdf') {
        const extractedText = await extractPdfText(fileBase64);
        if (extractedText.length > CONTENT_VALIDATION.MIN_PDF_TEXT_LENGTH) {
            console.log("PDF Text Extracted Client-Side", extractedText.length, "chars");
            promptParts = [{ text: `RESUME CONTENT:\n${extractedText}` }];
        } else {
            throw new Error("Could not extract text from PDF. Please upload a text-based PDF, not an image scan.");
        }
    } else {
        // Images must go as binary
        promptParts = [{ inlineData: { mimeType, data: fileBase64 } }];
    }

    const prompt = PARSING_PROMPTS.RESUME_PARSE();

    // Add prompt instructions
    promptParts.push({ text: prompt });

    return callWithRetry(async () => {
        try {
            const model = await getModel({
                model: 'gemini-2.0-flash', // Using 2.0-flash as standard model
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                type: { type: SchemaType.STRING, enum: ["summary", "work", "education", "project", "skill", "other"], format: "enum" },
                                title: { type: SchemaType.STRING },
                                organization: { type: SchemaType.STRING },
                                dateRange: { type: SchemaType.STRING },
                                bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                            },
                            required: ["type", "title", "organization", "bullets"]
                        }
                    }
                }
            });

            const response = await model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: promptParts
                    }
                ]
            });

            const text = response.response.text();
            if (!text) return [];

            // Add IDs to the parsed blocks
            const parsed = JSON.parse(text) as Omit<ExperienceBlock, 'id' | 'isVisible'>[];

            // Safety Check
            if (parsed.length > 0 && parsed[0].title === 'INVALID_DOCUMENT') {
                throw new Error(`Upload rejected: ${parsed[0].bullets[0] || "File does not appear to be a resume."}`);
            }

            return parsed.map(p => ({
                ...p,
                id: crypto.randomUUID(),
                isVisible: true,
                dateRange: p.dateRange || ''
            }));

        } catch (error: any) {
            console.error("Parse Resume Failed:", error);
            // Return empty array or throw? UI expects void or array.
            throw error;
        }
    });
};

// New function to parse raw HTML into JobFeedItems (Client-Side Fallback)
export const parseJobListing = async (
    html: string,
    baseUrl: string
): Promise<any[]> => {
    // Truncate HTML to save tokens
    const cleanHtml = html
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
        .replace(/\s+/g, " ")
        .substring(0, 20000);

    const prompt = PARSING_PROMPTS.JOB_LISTING_PARSE(cleanHtml, baseUrl);

    return callWithRetry(async () => {
        try {
            const model = await getModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: { type: SchemaType.STRING },
                                url: { type: SchemaType.STRING },
                                company: { type: SchemaType.STRING },
                                location: { type: SchemaType.STRING },
                                postedDate: { type: SchemaType.STRING }
                            },
                            required: ["title", "url", "company"]
                        }
                    }
                }
            });

            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            });

            const text = response.response.text();
            if (!text) return [];

            return JSON.parse(text);
        } catch (error) {
            console.error("Client-side parse failed:", error);
            return [];
        }
    });
};

export const tailorExperienceBlock = async (
    block: ExperienceBlock,
    jobDescription: string,
    instructions: string[]
): Promise<string[]> => {

    // Safety check for empty/invalid blocks
    if (!block.bullets || block.bullets.length === 0) return [];

    const prompt = ANALYSIS_PROMPTS.TAILOR_EXPERIENCE_BLOCK(
        jobDescription,
        block.title,
        block.organization,
        block.bullets,
        instructions
    );

    return callWithRetry(async () => {
        try {
            const model = await getModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature: AI_TEMPERATURE.BALANCED, // Little bit of creativity allowed for phrasing
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING }
                    }
                }
            });

            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            });

            const text = response.response.text();
            if (!text) return block.bullets; // Fallback

            return JSON.parse(text);
        } catch (error) {
            console.error("Tailoring failed:", error);
            // Fallback to original bullets on error
            return block.bullets;
        }
    });
};
