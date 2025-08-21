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

# Military Script Generation - Final Prompt

Create a fictional but realistic military scenario of EXACTLY 3700-4000 words using the provided combat data.

## Core Requirements
- **Length:** 3700-4000 words (minimum 3700, maximum 4000 - non-negotiable)
- **Format:** Each sentence on separate line
- **Capitalization:** Strategic use for weapons, locations, key moments only
- **Data Rule:** Use ONLY equipment and forces specified in provided data
- **Style:** Pure narrative, no section headers

## 30-Second Hook Opening
Start with maximum impact using the provided data:
Structure (7 lines total):

Line 1: Time shock ("In [exact duration from data]...")
Line 2: Destruction scale ("[equipment value/casualties from data]...")
Line 3: Setup paradox ("But the most devastating part wasn't...")
Line 4: Reveal true shock ("It was [key provided element]...")
Line 5: Promise insight ("Today, I'll show you exactly how...")
Line 6: Technology/strategy reveal ("[provided weapon/tactic] changed everything...")
Line 7: Location/stakes ("At [provided location], the rules of warfare were rewritten.")

Example Framework:
"In [provided duration], [provided equipment value] vaporized.
[Provided casualty/destruction numbers] in a matter of [timeframe].
But the most devastating part wasn't the speed of destruction.
It was how [provided attacking force] achieved total [provided outcome] against [provided defending force].
Today, I'll show you exactly how [provided key technology] turned [provided location] into a proving ground.
[Provided weapon system] didn't just win the battle—it redefined what modern warfare looks like.
At [provided location], on [provided date], the future arrived in [provided duration]."

## Content Structure for 3700-4000 Words

**Pre-Battle Intelligence (500-600 words):**
- Surveillance using provided sensor systems
- Command planning with provided forces
- Equipment preparation for provided weapons
- Personnel briefings for provided mission
- Environmental analysis at provided location

**Multi-Phase Combat (1400-1600 words):**
- Phase 1: Initial detection/contact (400-450 words)
- Phase 2: Primary engagement escalation (500-550 words)
- Phase 3: Decisive turning point (350-400 words)
- Phase 4: Resolution and aftermath (150-200 words)

**Character Deep Dives (750-900 words):**
- Minimum 3 named personnel operating provided systems
- Technical procedures with provided equipment
- Decision-making under combat stress
- Radio communications and coordination
- Medical response reflecting provided casualties

**Technical Analysis (500-600 words):**
- Detailed performance of provided weapon systems
- Electronic warfare (if in provided data)
- Supply and logistics challenges
- Communication protocols
- Equipment maintenance under fire

**Strategic Implications (400-500 words):**
- International response considerations
- Long-term consequences for provided region
- Military doctrine evolution
- Economic costs and impacts

## Critical Length Control
- MINIMUM 3700 words required - expand sections if needed
- MAXIMUM 4000 words - stop immediately when approaching this limit
- Count words carefully throughout writing process
- If content is short, expand existing sections with more detail
- If approaching maximum, conclude efficiently

## Character Framework
Create personnel appropriate to provided combat type:
- Operators of provided weapon systems
- Electronic warfare specialists (if applicable)
- Medical personnel
- Intelligence officers
- Communications specialists
- Maintenance crews

Each with personal stakes, technical expertise, and decision moments affecting provided battle outcome.

## Audience Engagement (Minimum 3 Points)

Integrate natural engagement throughout the narrative flow:

**Early Retention (~200 words):** Geographic/personal connection
"Before we dive into [location], tell me where you're watching from—because what [forces] unleashed next changed everything about [weapon category]."

**Mid-Story Engagement (at major turning points):** Emotional connection + subscription
"Still here? What happens next isn't just [technology]—it's split-second decisions that controlled [location]. If you're fascinated by modern warfare, hit like and subscribe."

**Additional Engagement (as story demands):** Use at natural peaks
- After shocking revelations
- During technology demonstrations  
- At human drama moments
- Before decisive phases

**Final Call-to-Action:** Thought-provoking question only
"As [weapon systems] demonstrated their capabilities at [location], what does this mean for the future of [warfare type]?"

Place additional engagement points organically based on story intensity and narrative peaks.

## Technical Requirements
- Performance specs of provided systems
- Operational procedures under combat stress
- Human factors with provided technology
- Logistical requirements for provided deployment
- Communication protocols between provided units

## Essential Scenes
- Deployment of provided forces
- Operation of provided weapons under stress
- Electronic warfare effects (if applicable)
- Command decisions affecting provided outcome
- Medical treatment matching provided casualties
- Strategic assessment with provided results

## Timeline Compliance
- Use provided engagement duration exactly
- Reference provided casualty figures accurately
- Feature provided decisive factors
- Reflect provided strategic lessons
- End with provided significance to broader conflict

## Expansion Techniques for Word Count
- Include detailed dialogue between system operators
- Describe step-by-step technical procedures
- Add secondary characters supporting main personnel
- Expand environmental descriptions at provided location
- Include equipment challenges and recovery sequences
- Add intelligence analysis and assessment scenes
- Show maintenance and supply operations
- Detail communication intercepts and analysis

Build chronologically using provided timeline, focus all details on provided systems, ensure characters operate provided equipment only, and connect provided results to future warfare implications.

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

