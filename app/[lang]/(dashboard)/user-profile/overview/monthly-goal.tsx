"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Target, Edit, Lock, TrendingUp, AlertCircle, HelpCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface GoalData {
  currentMonth: {
    month: number;
    year: number;
    goal: {
      id: string;
      targetUnits: number;
      actualUnits: number;
      progress: number;
      isLocked: boolean;
    } | null;
    needsGoal: boolean;
    canSetGoal: boolean;
    canManagerEdit: boolean;
    isFirstOfMonth: boolean;
    dayOfMonth: number;
  };
}

export default function MonthlyGoal() {
  const [data, setData] = useState<GoalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetGoal, setShowSetGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGoal();
  }, []);

  // Show popup on first of month if no goal
  useEffect(() => {
    if (data?.currentMonth.needsGoal && data?.currentMonth.isFirstOfMonth) {
      setShowSetGoal(true);
    }
  }, [data]);

  const fetchGoal = async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.currentMonth.goal) {
          setNewGoal(json.currentMonth.goal.targetUnits.toString());
        }
      }
    } catch (err) {
      console.error("Failed to fetch goal:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = async () => {
    const units = parseInt(newGoal);
    if (isNaN(units) || units < 1 || units > 99) {
      toast({
        title: "Invalid goal",
        description: "Please enter a number between 1 and 99",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUnits: units })
      });

      if (res.ok) {
        toast({ title: "Goal saved!" });
        setShowSetGoal(false);
        fetchGoal();
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save goal",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString("default", { month: "long" });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { currentMonth } = data;
  const goal = currentMonth.goal;

  const getProgressColor = () => {
    if (!goal) return "bg-default-200";
    if (goal.progress >= 100) return "[&>div]:bg-green-500";
    if (goal.progress >= 75) return "[&>div]:bg-[#E96114]";
    if (goal.progress >= 50) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-red-500";
  };

  const getStatusMessage = () => {
    if (!goal) return "Set your goal to get started!";
    if (goal.progress >= 100) return "Goal achieved! 🎉";

    const daysLeft = 30 - currentMonth.dayOfMonth;
    const unitsNeeded = goal.targetUnits - goal.actualUnits;

    if (goal.progress >= 75) return `Almost there! ${unitsNeeded} more to go!`;
    if (daysLeft > 0) return `${unitsNeeded} units needed in ${daysLeft} days`;
    return "Keep pushing!";
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between border-none mb-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#E96114]" />
            {getMonthName(currentMonth.month)} Goal
          </CardTitle>
          <div className="flex items-center gap-2">
            {goal?.isLocked && (
              <Lock className="w-4 h-4 text-default-400" title="Goal is locked" />
            )}
            {(currentMonth.canSetGoal || currentMonth.canManagerEdit) && !goal?.isLocked && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowSetGoal(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {goal ? (
            <div className="space-y-4">
              {/* Main Progress Circle */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-default-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      className={goal.progress >= 100 ? "text-green-500" : "text-[#E96114]"}
                      strokeDasharray={`${Math.min(goal.progress, 100) * 3.52} 352`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{goal.actualUnits}</span>
                    <span className="text-sm text-default-500">/ {goal.targetUnits}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-default-500">Progress</span>
                  <span className={`font-bold ${goal.progress >= 100 ? "text-green-500" : "text-[#E96114]"}`}>
                    {goal.progress}%
                  </span>
                </div>
                <Progress value={Math.min(goal.progress, 100)} className={`h-2 ${getProgressColor()}`} />
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <TrendingUp className={`w-4 h-4 ${goal.progress >= 100 ? "text-green-500" : "text-[#E96114]"}`} />
                <span className="text-default-600">{getStatusMessage()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-default-300" />
              <p className="text-default-600 mb-2">No goal set for this month</p>
              <Button
                onClick={() => setShowSetGoal(true)}
                className="bg-[#E96114] hover:bg-[#E96114]/90"
              >
                Set Your Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Goal Dialog */}
      <Dialog open={showSetGoal} onOpenChange={setShowSetGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#E96114]" />
              Set {getMonthName(currentMonth.month)} Goal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Goal Setting Rules</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Set your goal in the first 5 days of the month</li>
                    <li>• Managers can adjust until the 20th</li>
                    <li>• Goals are locked after the 20th</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-default-700 block mb-2">
                How many units do you plan to sell this month?
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="text-center text-2xl font-bold"
                  placeholder="0"
                />
                <span className="text-default-500">units</span>
              </div>
              <p className="text-xs text-default-400 mt-1">Enter a number between 1-99</p>
            </div>

            {goal && (
              <div className="text-sm text-default-500">
                Current progress: {goal.actualUnits} units sold
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetGoal(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveGoal}
              disabled={saving}
              className="bg-[#E96114] hover:bg-[#E96114]/90"
            >
              {saving ? "Saving..." : "Save Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
