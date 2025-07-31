import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberInfoProps {
  avatarUrl?: string;
  fullName: string;
  email: string;
  className?: string;
}

export function SomeInfoMember({
  avatarUrl,
  fullName,
  email,
  className,
}: MemberInfoProps) {
  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUrl} alt={fullName} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-0.5">
        <div className="font-medium text-sm">{fullName}</div>
        <div className="text-xs text-muted-foreground">{email}</div>
      </div>
    </div>
  );
}
