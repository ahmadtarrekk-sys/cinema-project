import { getTranslations } from "next-intl/server";
import { BotMessageSquare } from "lucide-react";

export default async function ChatPage() {
  const t = await getTranslations("Navigation");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-chat rounded-2xl border border-white/5 my-8">
      <div className="h-20 w-20 bg-gold/10 rounded-full flex items-center justify-center mb-6">
        <BotMessageSquare className="h-10 w-10 text-gold" />
      </div>
      <h1 className="text-3xl font-display font-bold text-white mb-4">
        Starlight AI Assistant
      </h1>
      <p className="text-muted-foreground max-w-lg mb-8">
        We've upgraded our AI assistant to be available everywhere! Simply click the floating chat icon in the bottom right corner of any page to start getting personalized movie and snack recommendations.
      </p>
    </div>
  );
}
