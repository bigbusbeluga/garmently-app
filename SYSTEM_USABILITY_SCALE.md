# System Usability Scale (SUS) - Garmently

## Instructions
Please rate your level of agreement with each statement on a scale of 1 to 5:
- **1** = Strongly Disagree
- **2** = Disagree
- **3** = Neutral
- **4** = Agree
- **5** = Strongly Agree

---

## SUS Questionnaire

### 1. I think that I would like to use Garmently frequently to manage my wardrobe.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 2. I found Garmently unnecessarily complex to navigate and use.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 3. I thought adding garments and creating outfits was easy to do.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 4. I think that I would need technical support to be able to use Garmently effectively.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 5. I found the various features in Garmently (wardrobe, outfits, mix & match) were well integrated.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 6. I thought there was too much inconsistency in the Garmently interface.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 7. I would imagine that most people would learn to use Garmently very quickly.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 8. I found managing my digital wardrobe with Garmently very cumbersome to use.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 9. I felt very confident using the wardrobe organization and outfit creation features.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

### 10. I needed to learn a lot of things before I could get going with Garmently.
**Scale:** 1 (Strongly Disagree) ─ 2 ─ 3 ─ 4 ─ 5 (Strongly Agree)

---

## Scoring Instructions

### Step 1: Score Contribution Calculation
- For **odd-numbered questions (1, 3, 5, 7, 9)**: Subtract 1 from the user response
- For **even-numbered questions (2, 4, 6, 8, 10)**: Subtract the user response from 5

### Step 2: Calculate Total Score
Sum all the score contributions from Step 1.

### Step 3: Calculate Final SUS Score
Multiply the total from Step 2 by 2.5 to obtain the overall SUS score (range: 0-100).

### Interpreting the SUS Score:
- **0-25**: Worst Imaginable
- **26-39**: Poor
- **40-52**: OK
- **53-73**: Good
- **74-85**: Excellent
- **86-100**: Best Imaginable

**Average SUS Score Benchmark:** 68

---

## Context-Specific Features Being Evaluated

This SUS questionnaire evaluates the following Garmently features:

1. **User Authentication** - Login/Signup process
2. **Wardrobe Management** - Adding, editing, deleting garments with image upload
3. **Category Filtering** - Organizing clothes by categories (Tops, Bottoms, Outerwear, etc.)
4. **Outfit Creation** - Mix & Match feature with drag-and-drop interface
5. **Outfit Viewing** - Visual canvas showing outfit arrangements
6. **Search & Filter** - Finding specific garments quickly
7. **Status Tracking** - Clean/Dirty status and wear history
8. **Visual Design** - Glassmorphism UI with intuitive navigation
9. **Mobile Responsiveness** - Usability across different devices
10. **Overall User Experience** - Ease of accomplishing wardrobe organization tasks

---

## Example Calculation

**Sample User Responses:**
1. Question 1: 5 → 5 - 1 = **4**
2. Question 2: 2 → 5 - 2 = **3**
3. Question 3: 4 → 4 - 1 = **3**
4. Question 4: 1 → 5 - 1 = **4**
5. Question 5: 5 → 5 - 1 = **4**
6. Question 6: 2 → 5 - 2 = **3**
7. Question 7: 4 → 4 - 1 = **3**
8. Question 8: 1 → 5 - 1 = **4**
9. Question 9: 5 → 5 - 1 = **4**
10. Question 10: 2 → 5 - 2 = **3**

**Total:** 4 + 3 + 3 + 4 + 4 + 3 + 3 + 4 + 4 + 3 = **35**

**Final SUS Score:** 35 × 2.5 = **87.5** (Best Imaginable - Excellent usability!)

---

## Administration Guidelines

### When to Administer:
- After users complete key tasks (adding garments, creating outfits)
- At the end of a usability testing session
- After users have used the app for at least 10-15 minutes
- As part of periodic user satisfaction surveys

### Best Practices:
1. Administer immediately after interaction with the system
2. Don't explain the questions - let users interpret naturally
3. Don't provide hints or assistance during completion
4. Collect demographic data separately (before or after SUS)
5. Use exact wording of questions (don't modify)
6. Ensure users complete all 10 questions

### Sample Size Recommendations:
- **Minimum:** 8-12 users for reliable results
- **Recommended:** 20+ users for statistical significance
- **Ideal:** 30+ users for robust analysis

---

## Digital Implementation

You can implement this SUS questionnaire in Garmently as:

### Option 1: Post-Task Survey
Show after user completes their first outfit creation

### Option 2: Exit Survey
Display when user logs out or closes the app

### Option 3: Periodic Check-in
Prompt users after using the app for 7 days

### Example React Component Structure:
```javascript
const SUSQuestionnaire = () => {
  const questions = [
    { id: 1, text: "I think that I would like to use Garmently frequently...", positive: true },
    { id: 2, text: "I found Garmently unnecessarily complex...", positive: false },
    // ... remaining questions
  ];
  
  return (
    <div className="sus-survey">
      {questions.map(q => (
        <LikertScaleQuestion key={q.id} question={q} />
      ))}
    </div>
  );
};
```

---

## Competitive Benchmarking

Compare Garmently's SUS score against:
- **Fashion/Wardrobe Apps:** Target SUS > 70
- **E-commerce Platforms:** Average SUS ~ 68
- **Social Media Apps:** Average SUS ~ 72
- **Productivity Tools:** Average SUS ~ 71

**Goal for Garmently:** Achieve SUS ≥ 75 (Excellent)

---

## Follow-up Questions (Optional)

After completing the SUS, consider asking:

1. **What did you like most about Garmently?** (Open-ended)
2. **What was the most frustrating aspect?** (Open-ended)
3. **What feature would you add or improve?** (Open-ended)
4. **How likely are you to recommend Garmently to a friend?** (NPS: 0-10)
5. **Which feature do you use most frequently?** (Multiple choice)
   - [ ] Wardrobe/Inventory
   - [ ] Mix & Match
   - [ ] Outfits
   - [ ] Dashboard

---

## Next Steps

1. **Create digital form** using Google Forms, Typeform, or integrate directly into Garmently
2. **Recruit test users** (friends, family, beta testers)
3. **Collect responses** from at least 10-15 users
4. **Calculate average SUS score**
5. **Analyze results** to identify improvement areas
6. **Iterate on design** based on low-scoring questions
7. **Re-test** after implementing improvements

---

*Last Updated: December 1, 2025*
*Application: Garmently - Digital Wardrobe Management System*
