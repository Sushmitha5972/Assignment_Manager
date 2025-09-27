import React, { useState } from 'react';
import API from '../api';

export default function Chatbot() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [qLoading, setQLoading] = useState(false);

  // Fetch productivity tips
  const getTip = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bot/tip?days=14');
      setTips(res.data.tips || ['No tips available.']);
    } catch (err) {
      setTips(['Could not get tip.']);
    } finally {
      setLoading(false);
    }
  };

  // Rule-based answer
  const getAnswer = (q) => {
    q = q.toLowerCase();

    // Greetings
  if (q.includes('hello') || q.includes('hi') || q.includes('hey'))
    return 'Hello! How can I help you today?';

  // Assignments
  if (q.includes('assignment') && q.includes('due'))
    return 'You can check your upcoming assignments and deadlines in the Dashboard.';
  if (q.includes('assignment') && q.includes('add'))
    return 'You can add new assignments using the "+" button in the Dashboard.';
  if (q.includes('assignment') && q.includes('completed'))
    return 'Mark your completed assignments as done to keep track of pending tasks.';
  if (q.includes('deadline') || q.includes('due date'))
    return 'All assignment deadlines are visible in the Dashboard under the assignment cards.';
  if (q.includes('priority'))
    return 'You can set priorities as High, Medium, or Low while creating an assignment.';
  
  // Productivity
  if (q.includes('tip') || q.includes('productivity'))
    return 'Break your work into smaller tasks, set deadlines, and focus on one task at a time for maximum productivity.';
  if (q.includes('focus') || q.includes('concentration'))
    return 'Try the Pomodoro technique: 25 minutes of work followed by a 5-minute break.';
  if (q.includes('motivation'))
    return 'Set clear goals, reward yourself for completing tasks, and stay consistent to maintain motivation.';
  if (q.includes('time') || q.includes('schedule'))
    return 'Plan your day in advance, prioritize tasks, and allocate specific time slots for each assignment.';
  
  // Account management
  if (q.includes('login'))
    return 'You can login using your registered email and password.';
  if (q.includes('signup') || q.includes('register'))
    return 'Click on Signup to create a new account.';
  if (q.includes('forgot') && q.includes('password'))
    return 'You can reset your password using the "Forgot Password" link on the login page.';
  
  // General help
  if (q.includes('help'))
    return 'I am here to help! Ask me about assignments, deadlines, priorities, productivity tips, or time management.';
  
  // Time management specific
  if (q.includes('schedule') || q.includes('plan'))
    return 'Use your Dashboard to schedule assignments and track your progress efficiently.';
  if (q.includes('procrastinate') || q.includes('delay'))
    return 'Break tasks into smaller chunks and use time-blocking to avoid procrastination.';

  // If no match
  return "I'm not sure about that. Try asking about assignments, deadlines, productivity tips, or time management.";
    
  };

  // Ask a question
  const askQuestion = async () => {
    if (!question.trim()) return;
    setQLoading(true);
    try {
      // Optionally, you can fetch dynamic answers from API here
      const answer = getAnswer(question); 
      setAnswers(prev => [...prev, { q: question, a: answer }]);
      setQuestion('');
    } catch (err) {
      setAnswers(prev => [...prev, { q: question, a: 'Could not get answer.' }]);
    } finally {
      setQLoading(false);
    }
  };

  return (
    <div className="chatbot card">
      <h3>Productivity Bot</h3>

      {/* Productivity Tips */}
      <button onClick={getTip} disabled={loading}>
        {loading ? 'Thinking...' : 'Get Productivity Tip'}
      </button>
      <div className="tips">
        {tips.map((t, i) => (
          <div key={i} className="tip">• {t}</div>
        ))}
      </div>

      <hr />

      {/* Question Input */}
      <div className="ask-section">
        <input
          type="text"
          placeholder="Ask your question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && askQuestion()}
          disabled={qLoading}
        />
        <button onClick={askQuestion} disabled={qLoading}>
          {qLoading ? 'Thinking...' : 'Ask'}
        </button>
      </div>

      {/* Display Answers */}
      <div className="answers">
        {answers.map((item, i) => (
          <div key={i} className="answer-block">
            <strong>You:</strong> {item.q}<br/>
            <strong>Bot:</strong> {item.a}
          </div>
        ))}
      </div>
    </div>
  );
}