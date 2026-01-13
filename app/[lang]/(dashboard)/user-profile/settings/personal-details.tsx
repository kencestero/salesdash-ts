"use client"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

// US Timezones only
const US_TIMEZONES = [
  { value: "America/New_York", label: "(EST) Eastern Time" },
  { value: "America/Chicago", label: "(CST) Central Time" },
  { value: "America/Denver", label: "(MST) Mountain Time" },
  { value: "America/Phoenix", label: "(MST) Arizona (No DST)" },
  { value: "America/Los_Angeles", label: "(PST) Pacific Time" },
  { value: "America/Anchorage", label: "(AKST) Alaska Time" },
  { value: "Pacific/Honolulu", label: "(HST) Hawaii Time" },
];

interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  role?: string;
  city?: string;
  zipcode?: string;
  about?: string;
  timezone?: string;
  website?: string;
  createdAt?: string;
}

const PersonalDetails = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({});

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile({
            firstName: data.profile?.firstName || '',
            lastName: data.profile?.lastName || '',
            phone: data.profile?.phone || '',
            email: data.user?.email || '',
            role: data.profile?.role || 'salesperson',
            city: data.profile?.city || '',
            zipcode: data.profile?.zipcode || '',
            about: data.profile?.about || '',
            timezone: data.profile?.timezone || '',
            website: data.profile?.website || '',
            createdAt: data.profile?.createdAt || data.user?.createdAt || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Get role display name
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'director': return 'Director';
      case 'manager': return 'Manager';
      case 'salesperson': return 'Sales Rep';
      default: return 'Sales Rep';
    }
  };

  // Format joining date
  const getJoiningDate = () => {
    if (profile.createdAt) {
      try {
        return format(new Date(profile.createdAt), "MMMM do, yyyy");
      } catch {
        return "N/A";
      }
    }
    return "N/A";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          city: profile.city,
          zipcode: profile.zipcode,
          about: profile.about,
          timezone: profile.timezone,
          website: profile.website,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-t-none pt-6">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-t-none pt-6">
      <CardContent>
        <div className="grid grid-cols-12 md:gap-x-12 gap-y-5">
          {/* First Name */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="firstName" className="mb-2 text-sm font-medium">First Name</Label>
            <Input
              id="firstName"
              value={profile.firstName || ''}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="text-base h-11"
            />
          </div>

          {/* Last Name */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="lastName" className="mb-2 text-sm font-medium">Last Name</Label>
            <Input
              id="lastName"
              value={profile.lastName || ''}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="text-base h-11"
            />
          </div>

          {/* Phone Number */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="phoneNumber" className="mb-2 text-sm font-medium">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="text-base h-11"
            />
          </div>

          {/* Email Address (Read-only) */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="email" className="mb-2 text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              value={profile.email || ''}
              readOnly
              disabled
              className="text-base h-11 bg-muted/50 cursor-not-allowed"
            />
          </div>

          {/* Joining Date (Auto-filled, non-editable) */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="joiningDate" className="mb-2 text-sm font-medium">Joining Date</Label>
            <Input
              id="joiningDate"
              value={getJoiningDate()}
              readOnly
              disabled
              className="text-base h-11 bg-muted/50 cursor-not-allowed"
            />
          </div>

          {/* Website */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="website" className="mb-2 text-sm font-medium">Website</Label>
            <Input
              id="website"
              value={profile.website || ''}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              placeholder="www.example.com"
              className="text-base h-11"
            />
          </div>

          {/* Organization (Auto-filled, non-editable) */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="organization" className="mb-2 text-sm font-medium">Organization</Label>
            <Input
              id="organization"
              value="Remotive Logistics"
              readOnly
              disabled
              className="text-base h-11 bg-muted/50 cursor-not-allowed"
            />
          </div>

          {/* Designation (Auto-filled from role, non-editable) */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="designation" className="mb-2 text-sm font-medium">Designation</Label>
            <Input
              id="designation"
              value={getRoleDisplay(profile.role || 'salesperson')}
              readOnly
              disabled
              className="text-base h-11 bg-muted/50 cursor-not-allowed"
            />
          </div>

          {/* City */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="city" className="mb-2 text-sm font-medium">City</Label>
            <Input
              id="city"
              value={profile.city || ''}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="text-base h-11"
            />
          </div>

          {/* Zip Code */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="zipCode" className="mb-2 text-sm font-medium">Zip Code</Label>
            <Input
              id="zipCode"
              value={profile.zipcode || ''}
              onChange={(e) => setProfile({ ...profile, zipcode: e.target.value })}
              className="text-base h-11"
            />
          </div>

          {/* Timezone (US only) */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="timezone" className="mb-2 text-sm font-medium">Timezone</Label>
            <Select
              value={profile.timezone || ''}
              onValueChange={(value) => setProfile({ ...profile, timezone: value })}
            >
              <SelectTrigger className="text-base h-11">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {US_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value} className="text-base">
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency (USD only for US company) */}
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="currency" className="mb-2 text-sm font-medium">Currency</Label>
            <Input
              id="currency"
              value="USD"
              readOnly
              disabled
              className="text-base h-11 bg-muted/50 cursor-not-allowed"
            />
          </div>

          {/* About */}
          <div className="col-span-12">
            <Label htmlFor="about" className="mb-2 text-sm font-medium">About</Label>
            <Textarea
              id="about"
              value={profile.about || ''}
              onChange={(e) => setProfile({ ...profile, about: e.target.value })}
              placeholder="Tell us about yourself..."
              className="text-base min-h-[120px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalDetails;
