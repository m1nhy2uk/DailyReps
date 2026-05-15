import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">DailyReps</CardTitle>
        <CardDescription>운동 기록을 시작하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
