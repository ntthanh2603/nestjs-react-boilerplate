import type { Member } from "@/types/interfaces/member.interface";

const membersService = {
  getCurrentMember(): Member {
    const member = localStorage.getItem("member");
    return member ? JSON.parse(member) : ({} as Member);
  },

  isAdmin(): boolean {
    const member = this.getCurrentMember();
    if (member) {
      const role = member.roleMember;
      if (role === "admin") {
        return true;
      } else {
        return false;
      }
    }
    return false;
  },
};

export default membersService;
