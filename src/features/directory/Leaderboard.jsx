import { Crown } from "lucide-react";
import { leaderboard } from "@/data/dummyData.js";

const Leaderboard = () => {
  const sorted = [...leaderboard].sort((a, b) => b.points - a.points);

  return (
    <div className="container mx-auto px-4 py-10">

      <div className="bg-card rounded-xl overflow-hidden border border-border">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-6">Name</div>
          <div className="col-span-3">Contributions</div>
          <div className="col-span-3 text-right">Points</div>
        </div>
        <div className="divide-y divide-border">
          {sorted.map((e, i) => (
            <div key={e.id} className="grid grid-cols-12 items-center gap-3 px-4 py-4">
              <div className="col-span-6 flex items-center gap-3">
                <div className="relative">
                  <img src={e.avatar} alt={e.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
                  {i < 3 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-[10px] text-primary-foreground flex items-center justify-center">
                      <Crown className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.role}</div>
                </div>
              </div>
              <div className="col-span-3">{e.contributions}</div>
              <div className="col-span-3 text-right font-semibold">{e.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
