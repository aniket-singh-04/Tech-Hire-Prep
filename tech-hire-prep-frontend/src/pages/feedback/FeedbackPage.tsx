import InterviewSummary from "../../components/feedback/InterviewSummary";
import NavigationButtons from "../../components/feedback/NavigationButtons";
import ProgressStepper from "../../components/feedback/ProgressStepper";
import ReviewCard from "../../components/feedback/ReviewCard";
import SubmitSuccessModal from "../../components/feedback/SubmitSuccessModal";
import { useFeedbackForm } from "../../hooks/useFeedbackForm";

export default function FeedbackPage() {

   const {
      form,
      step,
      nextStep,
      previousStep,
      progress,
      handleSubmit,
      ...
   } = useFeedbackForm();

   return (
      <>
         <InterviewSummary />

         <ProgressStepper />

         {step === 1 && <OverallSection />}

         {step === 2 && <TechnicalSection />}

         {step === 3 && <CommunicationSection />}

         {step === 4 && <InterviewFlowSection />}

         {step === 5 && <CodingSection />}

         {step === 6 && <StrengthSection />}

         {step === 7 && <CommentSection />}

         {step === 8 && (
             <ReviewCard />
         )}

         <NavigationButtons />

         <SubmitSuccessModal />
      </>
   )

}