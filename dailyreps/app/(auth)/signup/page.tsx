import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SignupForm from "./_components/SignupForm";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">DailyReps</CardTitle>
        <CardDescription>새 계정을 만들어보세요</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
