// Ensure that this is a client-side component
'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Import from next/navigation

interface SaveButtonProps {
  handleClicked: () => void;
  isSaved: boolean;
  isSaving: boolean;
}

const SaveButtonComponent = ({
  handleClicked,
  isSaved,
  isSaving,
}: SaveButtonProps) => {
  const router = useRouter(); // This will now work only on the client-side

  const handleViewReports = () => {
    router.push("/dashboard/reports"); // Navigate to the reports page
  };

  return (
    <div className="mt-4">
      {!isSaved ? (
        // Save button - displayed until the scan is saved
        <Button
          onClick={handleClicked}
          disabled={isSaving} // Disable if still saving
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          {isSaving ? "Saving..." : "Save Scan Results"}
        </Button>
      ) : (
        // View Reports button - displayed after the scan is saved
        <Button
          onClick={handleViewReports}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          View Reports
        </Button>
      )}
    </div>
  );
};

export default SaveButtonComponent;
