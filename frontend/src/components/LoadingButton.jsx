import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Button component with built-in loading state
 */
const LoadingButton = ({
  children,
  isLoading = false,
  loadingText = "Loading...",
  disabled,
  icon: Icon,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
        </>
      )}
    </Button>
  );
};

export default LoadingButton;

