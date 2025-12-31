import openai from '../config/openai.js';

// Role-specific question guidelines
const roleGuidelines = {
  frontend: {
    description: 'Frontend Engineer',
    topics: ['React/Vue/Angular', 'JavaScript/TypeScript', 'CSS/Styling', 'Performance', 'Accessibility', 'State Management', 'Browser APIs', 'Build Tools'],
    0: { focus: 'HTML, CSS basics, JavaScript fundamentals, basic React concepts', difficulty: 'basic concepts and syntax' },
    1: { focus: 'Component lifecycle, state management, event handling, responsive design', difficulty: 'practical implementation' },
    2: { focus: 'Advanced hooks, performance optimization, complex state management, testing', difficulty: 'optimization and best practices' },
    3: { focus: 'Architecture decisions, scalability, advanced patterns, team leadership', difficulty: 'system design and mentoring' },
    4: { focus: 'Framework internals, micro-frontends, performance at scale, technical strategy', difficulty: 'expert-level architecture' },
  },
  backend: {
    description: 'Backend Engineer',
    topics: ['API Design', 'Databases', 'System Architecture', 'Security', 'Scalability', 'Caching', 'Message Queues', 'Microservices'],
    0: { focus: 'REST APIs, basic database queries, HTTP methods, simple CRUD operations', difficulty: 'fundamental concepts' },
    1: { focus: 'Database relationships, authentication, error handling, API documentation', difficulty: 'practical development' },
    2: { focus: 'Database optimization, caching strategies, API security, testing', difficulty: 'performance and security' },
    3: { focus: 'System design, scalability patterns, microservices, database sharding', difficulty: 'distributed systems' },
    4: { focus: 'High-scale architecture, complex distributed systems, technical leadership', difficulty: 'enterprise architecture' },
  },
  hr: {
    description: 'HR/Behavioral Interview',
    topics: ['Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Conflict Resolution', 'Adaptability', 'Work Ethics'],
    0: { focus: 'Basic communication, learning attitude, teamwork, career goals', difficulty: 'entry-level scenarios' },
    1: { focus: 'Project collaboration, handling feedback, time management, growth mindset', difficulty: 'workplace situations' },
    2: { focus: 'Leading small tasks, mentoring juniors, handling conflicts, project ownership', difficulty: 'leadership scenarios' },
    3: { focus: 'Team leadership, strategic thinking, stakeholder management, decision making', difficulty: 'management situations' },
    4: { focus: 'Organizational impact, technical strategy, culture building, executive presence', difficulty: 'leadership at scale' },
  },
  aiml: {
    description: 'AI/ML Engineer',
    topics: ['Machine Learning', 'Deep Learning', 'Data Processing', 'Model Training', 'Feature Engineering', 'MLOps', 'Statistics'],
    0: { focus: 'Basic ML concepts, Python, data structures, simple algorithms', difficulty: 'fundamental ML concepts' },
    1: { focus: 'Supervised learning, model evaluation, feature engineering, basic neural networks', difficulty: 'practical ML implementation' },
    2: { focus: 'Advanced algorithms, hyperparameter tuning, model deployment, A/B testing', difficulty: 'production ML systems' },
    3: { focus: 'ML system design, model optimization, MLOps, team leadership', difficulty: 'scalable ML architecture' },
    4: { focus: 'Research-level problems, novel architectures, ML strategy, technical leadership', difficulty: 'cutting-edge ML' },
  },
};

// Number of questions and time allocation based on experience
const interviewConfig = {
  0: { questions: 8, timePerQuestion: 180, totalTime: 24 },  // Fresher: 8 questions, 3 min each = 24 min
  1: { questions: 10, timePerQuestion: 180, totalTime: 30 }, // Junior: 10 questions, 3 min each = 30 min
  2: { questions: 10, timePerQuestion: 240, totalTime: 40 }, // Mid: 10 questions, 4 min each = 40 min
  3: { questions: 12, timePerQuestion: 300, totalTime: 60 }, // Senior: 12 questions, 5 min each = 60 min
  4: { questions: 15, timePerQuestion: 300, totalTime: 75 }, // Expert: 15 questions, 5 min each = 75 min
};

/**
 * Get interview configuration
 * @param {number} experienceLevel - Experience level (0-4)
 * @returns {Object} Interview configuration
 */
export const getInterviewConfig = (experienceLevel) => {
  return interviewConfig[experienceLevel] || interviewConfig[1];
};

/**
 * Generate a single interview question using OpenAI GPT-4
 * @param {string} role - Interview role
 * @param {number} experienceLevel - Experience level (0-4)
 * @param {Array} previousQuestions - Array of previously asked questions
 * @returns {Object} Generated question with metadata
 */
export const generateQuestion = async (role, experienceLevel, previousQuestions = []) => {
  try {
    const guidelines = roleGuidelines[role] || roleGuidelines.frontend;
    const levelGuideline = guidelines[experienceLevel] || guidelines[1];
    const config = interviewConfig[experienceLevel] || interviewConfig[1];
    
    const questionNumber = previousQuestions.length + 1;
    const totalQuestions = config.questions;
    
    // Build context about previous questions
    const previousContext = previousQuestions.length > 0
      ? `\n\nPreviously asked questions (DO NOT repeat or be too similar):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    // Determine difficulty based on question progression
    let targetDifficulty = 'medium';
    if (questionNumber <= 2) targetDifficulty = 'easy';
    else if (questionNumber >= totalQuestions - 2) targetDifficulty = 'hard';

    const prompt = `You are an expert ${guidelines.description} interviewer conducting a ${config.totalTime}-minute interview.

CANDIDATE PROFILE:
- Experience Level: ${levelGuideline.focus}
- Question ${questionNumber} of ${totalQuestions}
- Time per question: ${config.timePerQuestion} seconds

QUESTION REQUIREMENTS:
1. Focus Area: ${levelGuideline.focus}
2. Difficulty: ${targetDifficulty} (${levelGuideline.difficulty})
3. Topics to cover: ${guidelines.topics.join(', ')}
4. Must be PRACTICAL and SCENARIO-BASED (not just theoretical)
5. Should test real-world problem-solving ability
6. Must be answerable in ${config.timePerQuestion} seconds${previousContext}

QUESTION TYPES TO USE:
- Scenario-based: "How would you handle/implement/solve..."
- Problem-solving: "Given this situation, what approach would you take..."
- Experience-based: "Describe a time when..." (for HR)
- Code review: "What's wrong with this code and how would you fix it..."
- Design: "How would you design/architect..."

Generate ONE high-quality, practical interview question.

Return ONLY a JSON object:
{
  "question": "Detailed, scenario-based question here",
  "category": "Specific category from topics list",
  "difficulty": "${targetDifficulty}",
  "expectedDuration": ${config.timePerQuestion}
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${guidelines.description} interviewer who generates practical, scenario-based questions that test real-world skills. Always respond with valid JSON only. Make questions specific, detailed, and relevant to actual job scenarios.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // Higher temperature for more variety
      max_tokens: 600,
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const questionData = JSON.parse(jsonContent);

    if (!questionData.question) {
      throw new Error('Invalid question format from OpenAI');
    }

    return {
      success: true,
      question: {
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: questionData.question,
        category: questionData.category || 'General',
        difficulty: questionData.difficulty || targetDifficulty,
        expectedDuration: config.timePerQuestion,
      },
      tokensUsed: response.usage.total_tokens,
    };
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error(`Failed to generate question: ${error.message}`);
  }
};

/**
 * Evaluate a candidate's answer using OpenAI GPT-4
 * @param {string} question - The interview question
 * @param {string} answer - Candidate's answer
 * @param {string} role - Interview role
 * @param {number} experienceLevel - Experience level (0-4)
 * @returns {Object} Evaluation with score and feedback
 */
export const evaluateAnswer = async (question, answer, role, experienceLevel) => {
  try {
    const roleDesc = roleDescriptions[role] || role;
    const expLevel = experienceLevels[experienceLevel] || 'Junior';

    // Handle empty or very short answers
    if (!answer || answer.trim().length < 10) {
      return {
        success: true,
        evaluation: {
          score: 0,
          feedback: 'No substantial answer provided. Please provide a detailed response to demonstrate your understanding.',
          strengths: [],
          improvements: ['Provide a complete answer', 'Explain your reasoning', 'Give specific examples'],
        },
        tokensUsed: 0,
      };
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Role: ${roleDesc}
Experience Level: ${expLevel}
Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer based on:
1. Correctness and accuracy
2. Completeness and depth
3. Clarity of explanation
4. Practical understanding
5. Appropriate for ${expLevel} level

Provide a score from 0-10 where:
- 0-3: Poor (incorrect, incomplete, or unclear)
- 4-5: Below Average (partially correct but lacking depth)
- 6-7: Good (correct and reasonably complete)
- 8-9: Excellent (thorough, clear, and insightful)
- 10: Outstanding (exceptional understanding and explanation)

Return ONLY a JSON object with this exact structure:
{
  "score": 7,
  "feedback": "2-3 sentences of constructive feedback highlighting what was good and what could be improved",
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"]
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer who provides fair, constructive, and actionable evaluations. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const evaluation = JSON.parse(jsonContent);

    // Validate score is between 0-10
    const score = Math.max(0, Math.min(10, evaluation.score || 0));

    return {
      success: true,
      evaluation: {
        score,
        feedback: evaluation.feedback || 'No feedback available',
        strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
        improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements : [],
      },
      tokensUsed: response.usage.total_tokens,
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
};

/**
 * Generate comprehensive final feedback for completed interview
 * @param {string} role - Interview role
 * @param {number} experienceLevel - Experience level (0-4)
 * @param {Array} answers - Array of question-answer pairs with evaluations
 * @returns {Object} Comprehensive feedback and overall score
 */
export const generateFinalFeedback = async (role, experienceLevel, answers) => {
  try {
    const roleDesc = roleDescriptions[role] || role;
    const expLevel = experienceLevels[experienceLevel] || 'Junior';

    // Calculate overall score
    const totalScore = answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0);
    const averageScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;
    const overallScore = Math.round((averageScore / 10) * 100); // Convert to percentage

    // Prepare detailed answers summary
    const answersSummary = answers
      .map((a, idx) => {
        const score = a.evaluation?.score || 0;
        return `Question ${idx + 1}: ${a.question}
Answer: ${a.answer.substring(0, 200)}${a.answer.length > 200 ? '...' : ''}
Score: ${score}/10
Feedback: ${a.evaluation?.feedback || 'No feedback'}`;
      })
      .join('\n\n---\n\n');

    const prompt = `You are an expert technical interviewer providing comprehensive final feedback after completing an interview.

Role: ${roleDesc}
Experience Level: ${expLevel}
Total Questions: ${answers.length}
Average Score: ${averageScore}/10 (${overallScore}%)

Interview Performance Summary:
${answersSummary}

Based on the entire interview, provide:
1. strengths: Array of 3-5 specific strengths demonstrated across all answers
2. weakAreas: Array of 3-5 areas that need improvement
3. improvements: Array of 3-5 actionable, specific recommendations for improvement
4. summary: A comprehensive paragraph (4-6 sentences) summarizing overall performance, readiness for the role, and key takeaways

Be specific, constructive, and actionable. Focus on patterns across multiple answers, not just individual responses.

Return ONLY a JSON object with this exact structure:
{
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weakAreas": ["specific weak area 1", "specific weak area 2", "specific weak area 3"],
  "improvements": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "summary": "Comprehensive paragraph summarizing overall performance..."
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer who provides comprehensive, constructive, and actionable feedback. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const feedback = JSON.parse(jsonContent);

    return {
      success: true,
      overallScore,
      averageScore,
      feedback: {
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
        weakAreas: Array.isArray(feedback.weakAreas) ? feedback.weakAreas : [],
        improvements: Array.isArray(feedback.improvements) ? feedback.improvements : [],
        summary: feedback.summary || 'Interview completed successfully.',
      },
      tokensUsed: response.usage.total_tokens,
    };
  } catch (error) {
    console.error('Error generating final feedback:', error);
    throw new Error(`Failed to generate final feedback: ${error.message}`);
  }
};

/**
 * Test OpenAI connection
 * @returns {Promise<boolean>}
 */
export const testOpenAIConnection = async () => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    });
    console.log('✅ OpenAI API connected successfully');
    return true;
  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error.message);
    return false;
  }
};

export default {
  generateQuestion,
  evaluateAnswer,
  generateFinalFeedback,
  getInterviewConfig,
  testOpenAIConnection,
};
