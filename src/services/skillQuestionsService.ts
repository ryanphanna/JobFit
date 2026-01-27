// Import AI service helper (we'll use getModel from geminiService since there's no standalone generateText export)

interface SkillQuestions {
    skillName: string;
    questions: string[];
    generatedAt: number;
}

const CACHE_KEY = 'skillQuestions_cache';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function getSkillVerificationQuestions(skillName: string): Promise<string[]> {
    // Check cache first
    const cached = getFromCache(skillName);
    if (cached) {
        return cached;
    }

    // Generate new questions
    const questions = await generateQuestionsForSkill(skillName);

    // Cache them
    saveToCache(skillName, questions);

    return questions;
}

async function generateQuestionsForSkill(skillName: string): Promise<string[]> {
    const questions = [
        `I have experience with ${skillName}`,
        `I can work independently with ${skillName}`,
        `I have used ${skillName} in multiple projects`
    ];
    return questions;
}

function getFromCache(skillName: string): string[] | null {
    try {
        const cacheStr = localStorage.getItem(CACHE_KEY);
        if (!cacheStr) return null;

        const cache: SkillQuestions[] = JSON.parse(cacheStr);
        const cached = cache.find(
            item => item.skillName.toLowerCase() === skillName.toLowerCase()
        );

        if (!cached) return null;

        // Check if cache is still valid
        const age = Date.now() - cached.generatedAt;
        if (age > CACHE_DURATION) {
            return null; // Cache expired
        }

        return cached.questions;
    } catch (error) {
        console.error('Error reading skill questions cache:', error);
        return null;
    }
}

function saveToCache(skillName: string, questions: string[]): void {
    try {
        const cacheStr = localStorage.getItem(CACHE_KEY);
        let cache: SkillQuestions[] = cacheStr ? JSON.parse(cacheStr) : [];

        // Remove old entry for this skill if exists
        cache = cache.filter(
            item => item.skillName.toLowerCase() !== skillName.toLowerCase()
        );

        // Add new entry
        cache.push({
            skillName,
            questions,
            generatedAt: Date.now()
        });

        // Keep cache size reasonable (max 100 skills)
        if (cache.length > 100) {
            cache = cache.slice(-100);
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error('Error saving skill questions cache:', error);
    }
}
