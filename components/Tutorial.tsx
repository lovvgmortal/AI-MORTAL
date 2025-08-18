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

const prompt2 = `You are an elite military analyst and combat correspondent with 25+ years of experience covering modern warfare.  
Your mission is to create a completely fictional but tactically realistic military scenario that is EXACTLY 2000-2300 words.  

## Critical Length Requirements
- The scenario MUST be between 2000-2300 words - this is non-negotiable.  
- Count every word carefully to ensure you meet this requirement.  
- If your first draft is too short, expand with more tactical details, specific weapon descriptions, additional combat phases, and deeper analysis.  
- Include extensive technical specifications, multiple engagement phases, detailed casualty reports, and comprehensive strategic analysis.  

## Mandatory Data Integration Requirements
- Date: [Insert specific date]  
- Time: [Insert specific time]  
- Location: [Insert location]  
- Attacking side: [Insert attacking force]  
- Defending side: [Insert defending force]  
- Scale: [Insert scale]  
- Key weapons: [Insert weapon systems]  

**TIMELINE REQUIREMENTS:**  
- Open with exact date and time: "On [DATE], at [TIME] local time..."  
- Include clear time progression throughout the scenario.  
- Use specific timestamps for major events (e.g., "At 06:45 local time...", "By 14:30...").  
- Show battle duration clearly from start to finish.  

## Output Format
- Each sentence must be on a separate line.  
- Use CAPITAL LETTERS only for key tactical terms, weapons, locations, and critical moments.  
- Strategic capitalization - do not overuse.  
- NO section headers in the output - pure narrative only.  
- Start directly with the scenario using provided data.  

## Content Development Strategy
- Technical weapon specifications and performance data.  
- Multiple engagement phases with specific timelines.  
- Detailed casualty reports and equipment losses.  
- Extensive tactical maneuvering descriptions.  
- Electronic warfare and communications disruption.  
- Supply chain and logistics complications.  
- Weather and terrain impact on operations.  
- Individual unit actions and heroic moments.  
- Command decision-making processes.  
- Intelligence gathering and reconnaissance details.  
- Air support and helicopter operations.  
- Medical evacuation and battlefield medicine.  
- Engineering and demolition activities.  
- Counter-intelligence and special operations.  
- Post-battle analysis and lessons learned.  

**Narrative phases to include:**  
1. Initial intelligence and preparation (200-250 words)  
2. Opening barrage and first contact (350-400 words)  
3. Main assault and armored engagement (400-500 words)  
4. Technology warfare and drone operations (300-400 words)  
5. Electronic warfare and communications battle (250-300 words)  
6. Decisive phase and turning point (300-350 words)  
7. Aftermath and strategic implications (200-250 words)  
8. Call-to-action conclusion with emotional impact  

## Style Guidelines
- **Sentence structure:** One complete sentence per line.  
- **Capitalization:** For weapons, units, key tactical moments.  
- **Tone:** Professional military analysis with dramatic battlefield narrative.  
- **Perspective:** Third-person with tactical insight.  
- **Pacing:** Build tension through escalating phases.  

## Call-To-Action (CTA) Requirements
You must integrate **multi-layered CTAs** throughout the script:  

1. **Early Retention CTA (after the initial hook, ~150 words in):**  
   - Invite the audience to comment and reflect.  
   - Example: *"Before we continue, tell me where in the world you are watching from — and let’s step deeper into the battlefield."*  

2. **Mid-battle CTA (after a turning point):**  
   - Tie like/subscribe to emotion (pride, humanity, fear).  
   - Example: *"Still watching? Good. Because what comes next isn’t just about firepower — it’s about survival. If you stand with those who fight against the odds, hit like and subscribe."*  

3. **Optional Surprise CTA (during climax):**  
   - Add urgency or patriotism.  
   - Example: *"No mercy. No retreat. If you believe in strength and resilience, share this story so more people see the truth."*  

4. **Final CTA (conclusion):**  
   - Must combine 3 things:  
     - A **thought-provoking question** about the future of warfare.  
     - A **direct call to subscribe/share/comment**.  
     - A **reference to [insert channel youtube]**.  
   - Example:  
     *"In an age of drones, cyber warfare, and shifting alliances, is the battlefield evolving faster than we can prepare for?  
     This is [insert channel youtube] — subscribe, share, and join the discussion as we uncover the future of modern warfare."*  

## Example Opening
"On July 15th, 2025, at 04:17 AM local time, the silence over [LOCATION] was shattered.  
RUSSIAN forces unleashed their opening BARRAGE against UKRAINIAN positions.  
The battle for [LOCATION] had begun."  

## Mandatory Progression
- Use provided data as foundation for entire scenario.  
- Build timeline around the specific date/time given.  
- Reference attacking/defending forces exactly as provided.  
- Feature specified weapons systems as key elements.  
- Maintain chronological progression with clear timestamps.  
- Every major phase must have specific time markers.  
`;


export const Tutorial: React.FC = () => {
    return (
        <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-10">
                <Icon name="book" className="mx-auto w-16 h-16 text-brand-primary mb-4" />
                <h1 className="text-2xl font-bold text-brand-text">Advanced Prompt Guide</h1>
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

