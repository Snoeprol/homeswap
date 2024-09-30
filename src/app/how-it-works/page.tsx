import { CheckCircleIcon } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Find a Swap Partner",
      description: "Search our platform for potential swap partners whose home and location match your preferences.",
    },
    {
      title: "Agree on Terms",
      description: "Discuss and agree on the swap duration, dates, and any specific conditions with your potential swap partner.",
    },
    {
      title: "Request Landlord Permission",
      description: "Both parties must obtain written permission from their respective landlords for the home exchange.",
    },
    {
      title: "Verify Eligibility",
      description: "Ensure both parties meet the eligibility criteria for each other's rental properties (e.g., income requirements, household size).",
    },
    {
      title: "Review Rental Agreements",
      description: "Carefully review the terms of both rental agreements, including rent amounts and any specific conditions.",
    },
    {
      title: "Sign New Rental Agreements",
      description: "Both parties sign new rental agreements with their respective new landlords.",
    },
    {
      title: "Arrange Key Exchange",
      description: "Coordinate the exchange of keys and any necessary information about the homes.",
    },
    {
      title: "Move and Enjoy Your Swap",
      description: "Move into your swap home and enjoy your new living experience!",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-orange-50 to-amber-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          How Home Swapping Works
        </h1>
        
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4">The Home Swap Process</h2>
          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Important Considerations</h2>
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>Both parties retain their tenant rights in their original homes.</li>
            <li>The exchange does not affect your registration with the municipality.</li>
            <li>Ensure that the rent for your new home is appropriate for your income and household situation.</li>
            <li>If the initial rent seems too high, you can request a rent assessment from the Huurcommissie (Rent Tribunal) within 6 months of moving in.</li>
            <li>For social housing, specific rules may apply regarding income limits and waiting times.</li>
          </ul>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Rent Assessment</h2>
          <p className="mb-4">If you believe the rent for your new home is too high, you can request a rent assessment:</p>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>Submit a request to the Huurcommissie within 6 months of the start of your tenancy.</li>
            <li>The Huurcommissie will assess if the rent is reasonable based on a points system.</li>
            <li>If the rent is deemed too high, it may be lowered to a fair amount.</li>
            <li>The assessment fee is €25, which is refunded if you win the case.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}