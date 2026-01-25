import { CONTENT_VALIDATION } from '../constants';

export const ANALYSIS_PROMPTS = {
    JOB_FIT_ANALYSIS: (jobDescription: string, resumeContext: string) => `
    You are a ruthless technical recruiter. Your job is to screen candidates for this role.
    
    INPUT DATA:
    1. RAW JOB TEXT (Scraped): 
    "${jobDescription.substring(0, CONTENT_VALIDATION.MAX_JOB_DESCRIPTION_LENGTH)}"

    2. MY EXPERIENCE PROFILES (Blocks with IDs):
    ${resumeContext}

    TASK:
    1. DISTILL: Extract the messy job text into a structured format.
    2. ANALYZE: Compare the Job to my experience blocks with extreme scrutiny.
    3. MATCH BREAKDOWN: Identify key strengths (PROVEN skills only) and weaknesses (MISSING requirements).
    4. SCORE: Rate compatibility (0-100). Be harsh. matching < 50% = reject.
    5. TAILORING: 
       - Select the specific BLOCK_IDs that are VITAL to this job. Exclude anything irrelevant.
       - Provide concise instructions. Don't say "Highlight your skills." Say "Rename 'Software Engineer' to 'React Developer' to match line 4 of job description."
    
    Return ONLY JSON.
  `,

    TAILOR_EXPERIENCE_BLOCK: (jobDescription: string, blockTitle: string, blockOrg: string, blockBullets: string[], instructions: string[]) => `
    You are an expert resume writer. 
    Rewrite the bullet points for this specific job experience to perfectly match the target job description.

    TARGET JOB:
    ${jobDescription.substring(0, 3000)}

    MY EXPERIENCE BLOCK:
    Title: ${blockTitle}
    Company: ${blockOrg}
    Original Bullets:
    ${blockBullets.map(b => `- ${b}`).join('\n')}

    TAILORING INSTRUCTIONS (Strategy):
    ${instructions.join('\n')}

    TASKS:
    1. Rewrite the bullets to use keywords from the Target Job.
    2. Shift the focus to relevant skills (e.g. if job needs "Leadership", emphasize leading the team).
    3. Quantify impact where possible.
    4. Keep the same number of bullets (or fewer if some are irrelevant).
    5. Tone: Action-oriented, professional, high-impact.

    Return ONLY a JSON array of strings: ["bullet 1", "bullet 2"]
    `,

    TAILORED_SUMMARY: (jobDescription: string, resumeContext: string) => `
    You are an expert resume writer. 
    Write a 2-3 sentence "Professional Summary" for the top of my resume.
    
    TARGET JOB:
    ${jobDescription.substring(0, 5000)}

    MY BACKGROUND:
    ${resumeContext}

    INSTRUCTIONS:
    - Pitch me as the perfect candidate for THIS specific role.
    - Use keywords from the job description.
    - Keep it concise, punchy, and confident (no "I believe", just facts).
    - Do NOT include a header or "Summary:", just the text.
    `,

    COVER_LETTER: {
        VARIANTS: {
            v1_direct: `
            You are an expert copywriter. Write a professional cover letter.
            
            INSTRUCTIONS:
            - Structure:
              1. THE HOOK: Open strong. Mention the specific role/company and ONE key reason you fit.
              2. THE EVIDENCE: Connect 1-2 specific achievements from my resume directly to their hardest requirements.
              3. THE CLOSE: Brief, confident call to action.
            - Tone: Professional but conversational (human), not robotic.
            - Avoid cliches like "I am writing to apply..." start fresher.
            `,
            v2_storytelling: `
            You are a career coach helping a candidate stand out. Write a cover letter that tells a compelling story.
            
            INSTRUCTIONS:
            - DO NOT start with "I am writing to apply". Start with a statement about the company's mission or a specific problem they are solving.
            - Narrative Arc: "I've always been passionate about [Industry/Problem]... which is why [Company] caught my eye."
            - Then pivot to: "In my role at [Previous Org], I faced a similar challenge..." (Insert Resume Evidence).
            - Ending: "I'd love to bring this energy to [Company]."
            - Tone: Enthusiastic, genuine, slightly less formal than a standard corporate letter.
            `,
            v3_experimental_pro: `
            You are a senior executive writing a cover letter. Write a sophisticated, high-level strategic letter.
            Focus on value proposition and ROI, not just skills.
            `
        },
        GENERATE: (template: string, jobDescription: string, resumeText: string, tailoringInstructions: string[], additionalContext?: string) => `
    ${template}

    JOB DESCRIPTION:
    ${jobDescription}

    MY EXPERIENCE:
    ${resumeText}

    STRATEGY:
    ${tailoringInstructions.join("\n")}

    ${additionalContext ? `MY ADDITIONAL CONTEXT (Important):
    ${additionalContext}
    Include this context naturally if relevant to the job requirements.` : ''}

    ${tailoringInstructions.includes("CRITIQUE_FIX") ? `
    IMPORTANT - REVISION INSTRUCTIONS:
    The previous draft was reviewed by a hiring manager. Fix these specific issues:
    ${additionalContext} 
    (Note: The text above is the critique feedback, not personal context in this case).
    ` : ''}
  `
    },

    CRITIQUE_COVER_LETTER: (jobDescription: string, coverLetter: string) => `
    You are a strict technical hiring manager. Review this cover letter for the job below.

    JOB:
    ${jobDescription.substring(0, 5000)}

    CANDIDATE LETTER:
    ${coverLetter}

    TASK:
    1. Would you interview this person based *only* on the letter?
    2. Score it 0-10.
    
    CRITIQUE CRITERIA:
    - Does it have a strong "Hook" (referencing the company/role specifically) or is it generic?
    - Is it just repeating the resume? (Bad) vs Telling a story? (Good)
    - Is it concise?

    3. List 3 strengths.
    4. List 3 specific improvements needed to make it a "Must Hire".

    Return specific JSON:
    {
      "score": number, 
      "decision": "interview" | "reject" | "maybe",
      "strengths": ["string"],
      "feedback": ["string"]
    }
    `
};
