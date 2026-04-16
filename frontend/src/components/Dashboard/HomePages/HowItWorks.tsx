import React from "react";
import Image from "next/image";

const STEPS = [
    {
        id: 1,
        title: "Create",
        image: "/images/HowItWorksCreate.png",
        description: "Build engaging educational content in minutes. Create interactive quests, design comprehensive quizzes, and set up surveys using our intuitive drag-and-drop editor. Choose from templates or start from scratch with ease.",
    },
    {
        id: 2,
        title: "Interact",
        image: "/images/HowItWorksInteract.png",
        description: "Engage students with real-time interactive experiences. Share your quests, quizzes, and surveys with learners, track live responses, and foster meaningful participation. Watch students progress through engaging educational journeys.",
    },
    {
        id: 3,
        title: "Analyze",
        image: "/images/HowItWorksAnalyze.png",
        description: "Gain actionable insights from detailed analytics and reports. Measure learning outcomes, analyze student performance on quizzes, and understand survey feedback. Make data-driven decisions to improve your educational content.",
    },
];

function HowItWorks() {
    return (
        <section className="w-full py-20 bg-gray-50">
            <div className="flex flex-col justify-center items-center">
                <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-6">
                    How it works
                </span>
                
                <h2 className="text-5xl font-bold text-gray-900 mb-4 text-center">
                    Get started in 3 simple steps
                </h2>
                
                <p className="text-lg text-gray-600 mb-16 max-w-2xl text-center">
                    EduQuest makes it easy to create engaging content, interact with learners, and measure success
                </p>

                <div className="w-full max-w-6xl px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {STEPS.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex flex-col rounded-xl bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex items-center justify-center h-48">
                                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                        {index + 1}
                                    </div>
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        width={250}
                                        height={250}
                                        className="w-full h-auto"
                                        priority={false}
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;