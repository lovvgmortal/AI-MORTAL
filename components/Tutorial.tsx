import React, { useState } from 'react';
import { Icon } from './Icon';
import { useToast } from '../contexts/ToastContext';

const TutorialSection: React.FC<{ title: string; icon: React.ComponentProps<typeof Icon>['name']; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
            <Icon name={icon} className="w-8 h-8 text-brand-primary mr-4" />
            <h2 className="text-2xl font-bold text-brand-text">{title}</h2>
        </div>
        <div className="space-y-4 text-brand-text-secondary leading-relaxed">
            {children}
        </div>
    </div>
);


const PromptToggle: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { showToast } = useToast();

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const textToCopy = String(children);
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast("Prompt copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy prompt:", err);
            showToast("Failed to copy prompt.");
        });
    };
  
    return (
      <div className="border border-brand-bg rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-3 text-left bg-brand-bg/30">
          <span className="font-semibold text-brand-text">{title}</span>
          <div className="flex items-center gap-2">
             <button 
              onClick={handleCopy} 
              className="text-brand-text-secondary hover:text-brand-text transition-colors p-1.5 rounded-full hover:bg-brand-bg/50"
              aria-label="Copy prompt"
              title="Copy prompt"
            >
              <Icon name="copy" className="w-4 h-4" />
            </button>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-brand-text-secondary hover:text-brand-text transition-colors p-1.5 rounded-full hover:bg-brand-bg/50"
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Collapse prompt' : 'Expand prompt'}
            >
              <Icon name="chevron-down" className={`w-5 h-5 transition-transform transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="p-3 border-t border-brand-bg">
            <pre className="bg-brand-bg/50 p-3 rounded-md text-xs whitespace-pre-wrap font-mono overflow-x-auto text-brand-text-secondary">
              <code>
                {children}
              </code>
            </pre>
          </div>
        )}
      </div>
    );
};

const prompt1 = `You are a military analyst with 20 years of experience in modern warfare research. 
Your task is to create a completely fictional but highly realistic combat scenario in terms of technical and tactical accuracy. 
Use your knowledge of modern weapons, real geography, and combat principles to generate credible information. 
Provide information only in the following standard format, do not add or omit other content. Use "N/A" for any category that does not apply to your scenario:

## BASIC INFORMATION:
- Date: [Specific date from 2024-2026]
- Location: [Specific city/village/region name]
- Attacking side: [Country/force]
- Defending side: [Country/force]

## GROUND FORCES:

### ATTACK SCALE:
- Tanks: [Number + specific type like T-90M, T-80BVM]
- Infantry: [Estimated number]
- UAV: [Specific names like Orlan-10, Lancet-3]
- Artillery: [Type like Tornado-S, Grad]
- Scale: [Small/Medium/Large]

### DEFENSIVE WEAPONS:
- Tanks: [Type like Leopard 2A6, Challenger 2]
- Anti-tank missiles: [Javelin, NLAW, TOW, etc.]
- Radar: [AN/TPQ-50, NASAMS]
- Artillery: [HIMARS, M777, Caesar]
- UAV: [Switchblade, TB2]

## NAVAL FORCES:
- Ships: [Type + number, or N/A]
- Submarines: [Class + capability, or N/A]
- Naval missiles: [Anti-ship, cruise missiles, or N/A]
- Maritime air defense: [Systems deployed, or N/A]

## AIR FORCES:
- Fighter aircraft: [Type + numbers, or N/A]
- Bombers: [Strategic/tactical, or N/A]
- Air defense: [SAM systems, interceptors]
- Electronic warfare: [Jamming, countermeasures, or N/A]

## CYBER & ELECTRONIC WARFARE:
- Cyber operations: [Network attacks, disruptions, or N/A]
- Electronic jamming: [GPS, communications, radar, or N/A]
- Information warfare: [Propaganda, disinformation, or N/A]

## STRATEGIC WEAPONS:
- Long-range missiles: [Ballistic, cruise, or N/A]
- Space assets: [Satellites, anti-satellite, or N/A]

## COMBAT RESULTS:
- Duration: [Specific minutes/hours/days]
- Attacker losses: [Personnel + equipment numbers]
- Defender losses: [Personnel + equipment numbers]
- Outcome: [Which side won + degree]

## TACTICAL FEATURES:
- Main tactics: [Brief description]
- Key technology: [Critical weapon/system]
- Decisive factors: [Reasons for victory/defeat]
- Unique characteristics: [What was special]

## STRATEGIC LESSONS:
- Main lessons: [Insights about modern warfare]
- Importance: [Significance for world military]
- Message: [Message sent to major powers]
`;

const prompt2 = `


Create a fictional but realistic military scenario of EXACTLY 3800-4100 words using the provided combat data.
Absolute Requirements
Word Count: 3800-4100 words minimum - maximum. No exceptions.
Data Compliance: Use ONLY the exact equipment, forces, numbers, locations, dates, and outcomes from provided data.
Format: Each sentence on a separate line. Pure narrative only - no film directions, music cues, or technical notes.
Capitalization: Strategic emphasis on key weapons/locations only. Do not overuse.
Opening Pattern
First sentence must show provided weapons in immediate explosive action:
Use provided weapon systems already firing/impacting/exploding.
Examples: "The [provided weapon] slammed into..." or "[Provided equipment] erupted in flames..."
NO setup, background, or quiet moments.
Lines 2-4 establish context:
Date, time, location from provided data.
Scale using provided numbers (casualties, equipment counts).
Stakes using provided forces and objectives.
Pacing Structure (Wave Intensity Model)
High-Intensity Combat Phase (2000 words mandatory):
Explosive Opening (600-700 words): Intensity 10/10. Sentences are short and brutal (5-12 words). Focus purely on weapon impacts and immediate, chaotic results.
Sustained Combat & Tactical Elaboration (700-800 words): Intensity fluctuates between 7-9. This is the key phase for word count expansion.
Sentence Structure: Mix short action sentences with longer, more technical descriptive sentences (15-25 words).
Content Focus: Describe detailed technical procedures, tactical dialogue, and characters' split-second analyses. Apply the Deep-Drilling Technique as outlined below.
Peak Crisis (700-800 words): Intensity returns to 10/10. Rapid-fire sentences. Multiple events happen simultaneously. The outcome of the battle is decided here. The writing should feel overwhelming and chaotic.
Expansion Phase (1800-2100 words - MANDATORY to reach total):
Battle Resolution (500-600 words): Intensity drops to 8, then 7. Immediate damage assessment.
Strategic Analysis (600-700 words): Intensity drops to 6, then 5. Tactical lessons, technology performance.
Broader Implications (500-600 words): Doctrine evolution, international response.
Final Reflection (200-300 words): Future warfare themes, concluding question.
Mandatory Word Count Techniques: The Deep-Drilling Method
To reach the 3800-4100 word count with fixed data, you MUST expand every possible detail. Do not introduce new events; instead, elaborate exhaustively on existing ones.
During the Sustained Combat phase, apply these "Deep-Drilling" rules:
Weapon System Procedures (Mandatory Expansion): For every weapon system used, dedicate 5-7 sentences to describe its operational sequence.
Example (Drone Strike): DO NOT just write "The drone fired a missile."
INSTEAD, WRITE: "Operator Jackson tracked the target vehicle on his monitor. The crosshairs glowed green, indicating a solid lock. His finger rested on the firing stud. 'Reaper-1, cleared hot,' the tactical controller's voice crackled. Jackson depressed the button. The Hellfire missile detached from the drone's wing pylon. Its rocket motor ignited, leaving a white smoke trail against the sky. The missile accelerated, its seeker head locked onto the tank's thermal signature."
Sensory Details (Mandatory Expansion): Describe the physical and sensory experience of the battle from the characters' perspectives.
Inside a Tank: The smell of cordite, the lurch of the vehicle, the metallic clang of the autoloader, the whine of the turbine engine, the heat from the electronics.
From a Pilot's View: The G-forces pressing them into their seat, the flashing warning lights on the console, the distorted sound of radio chatter through their helmet, the vast emptiness of the sky punctuated by missile trails.
Cause and Effect Chains (Mandatory Expansion): For every explosion or impact, describe the immediate aftermath in detail.
Example (Artillery Impact): DO NOT just write "The shell landed."
INSTEAD, WRITE: "The 155mm M795 shell landed just short of the trench. The earth erupted in a geyser of black soil and steel. The shockwave hit first, a physical punch that knocked soldiers off their feet. A razor-sharp wall of shrapnel followed, shredding sandbags and equipment. The sound, a deafening CRACK-BOOM, momentarily overwhelmed all communication."
Internal Tactical Thoughts (Mandatory Expansion): Briefly show the character's split-second decision-making process.
Example (Tank Commander): "Sgt. Miller saw the enemy T-90 traverse its turret. He sees us. Miller had two choices: fire now with a 90% solution, or wait for the laser rangefinder to confirm 100%. No time. 'Fire!' he roared into the intercom."
Audience Engagement Requirements
Early Engagement (after ~800 words):
"Before we dive deeper into [provided location], tell me where you're watching from—because what [provided forces] unleashed next changed everything about [provided weapon category]."
Mid-Script Engagement (after ~2500 words):
"Still here? What happens next isn't just [provided technology]—it's split-second decisions that controlled [provided location]. If you're fascinated by modern warfare, hit like and subscribe."
Final Question (conclusion):
"As [provided weapon systems] demonstrated their capabilities at [provided location], what does this mean for the future of [warfare type]?"
Character Development Requirements
Minimum 4 named characters operating provided equipment:
Tank commanders, pilots, drone operators, artillery crews as appropriate.
Technical expertise specific to provided weapon systems.
Personal stakes connected to provided battle outcome.
Individual decision-making affecting provided engagement results.
Character moments must include:
Background relevant to provided military specialization.
Family or personal connections motivating performance.
Technical training with provided equipment systems.
Combat experience affecting current engagement decisions.
Technical Integration Requirements
Every major provided weapon system must feature:
Detailed operational procedures during combat.
Specific performance characteristics under stress.
Technical challenges and solutions during engagement.
Integration with other provided systems and tactics.
Electronic warfare and communications (if applicable to provided data):
Jamming effects on provided communications systems.
Counter-measures and adaptive responses.
Command and control challenges during engagement.
Intelligence gathering and real-time updates.
Verification Checklist
Word count is 3800-4100 (count carefully throughout writing).
Opens with immediate explosive action from provided data.
Uses only provided equipment, forces, and numbers.
Each sentence is on a separate line with no technical directions.
Strategic capitalization is used without overuse.
All casualty and damage figures match provided data exactly.
Three audience engagement points are placed naturally.
Characters operate only provided equipment systems.
Technical details serve the narrative and maintain pacing.
Adheres strictly to the Wave Intensity pacing model.
Thoroughly applies the Deep-Drilling Technique to meet word count.
Concludes with a thought-provoking question about the provided technology.
`;


export const Tutorial: React.FC = () => {
    return (
        <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-10">
                <Icon name="book" className="mx-auto w-16 h-16 text-brand-primary mb-4" />
                <h1 className="text-2xl font-bold text-brand-text">Advanced Prompt Guide Ver 0.2 (UPDATE NEW)</h1>
                <p className="text-lg text-brand-text-secondary mt-2">A collection of expert prompts for advanced script generation.</p>
            </div>

            <TutorialSection title="Example Prompts for Advanced Generation" icon="sparkles">
                <p>
                    Here are specific, detailed prompts you can use as a starting point for the "Generate" and "Rewrite" modes to create highly structured military scenarios. Copy these and adapt them to your needs in the Editor.
                </p>
                <div className="space-y-3 mt-4">
                    <PromptToggle title="Prompt for Step 1: Generating Scenario Data">
                        {prompt1}
                    </PromptToggle>
                    <PromptToggle title="Prompt for Step 2: Generating Full Script">
                        {prompt2}
                    </PromptToggle>
                </div>
            </TutorialSection>
        </div>
    );
};

