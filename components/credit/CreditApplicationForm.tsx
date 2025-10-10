"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad, SignaturePadRef } from "./SignaturePad";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreditApplicationFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  dob: string;
  ssn: string;
  driverLicense: string;
  dlState: string;

  // Employment
  employer: string;
  jobTitle: string;
  employmentYears: number;
  monthlyIncome: number;

  // Housing
  housingStatus: "own" | "rent" | "other";
  monthlyPayment: number;
  yearsAtAddress: number;

  // Equipment
  equipmentType: string;
  equipmentDesc: string;
  requestedAmount: number;
  requestedTerm: number;

  // References
  ref1Name: string;
  ref1Phone: string;
  ref1Relationship: string;
  ref2Name: string;
  ref2Phone: string;
  ref2Relationship: string;

  // Legal
  legalConsent: boolean;
}

interface CreditApplicationFormProps {
  shareToken?: string;
  onSubmitSuccess?: (appNumber: string) => void;
}

const LEGAL_TEXT = `I hereby authorize MJ Cargo Sales to obtain credit information and reports from credit bureaus and other sources for the purpose of evaluating this credit application. I certify that all information provided in this application is true and complete to the best of my knowledge. I understand that any false or misleading information may result in denial of credit or termination of any credit agreement.

I authorize MJ Cargo Sales to verify my employment, income, and any other information provided in this application. I understand that this application does not obligate MJ Cargo Sales to extend credit, and final approval is subject to credit review and verification of all information provided.

By signing below, I acknowledge that I have read, understand, and agree to these terms and conditions.`;

export function CreditApplicationForm({ shareToken, onSubmitSuccess }: CreditApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const signatureRef = useRef<SignaturePadRef>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreditApplicationFormData>();

  const legalConsent = watch("legalConsent");

  const onSubmit = async (data: CreditApplicationFormData) => {
    setSubmitError(null);

    // Validate signature
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setSubmitError("Please provide your signature");
      return;
    }

    if (!data.legalConsent) {
      setSubmitError("You must agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);

    try {
      const signatureData = signatureRef.current.toDataURL();

      // Prepare references
      const references = [
        {
          name: data.ref1Name,
          phone: data.ref1Phone,
          relationship: data.ref1Relationship,
        },
        {
          name: data.ref2Name,
          phone: data.ref2Phone,
          relationship: data.ref2Relationship,
        },
      ];

      const payload = {
        ...data,
        signatureData,
        references,
        legalText: LEGAL_TEXT,
        shareToken,
      };

      const response = await fetch("/api/credit-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }

      const result = await response.json();
      onSubmitSuccess?.(result.appNumber);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                currentStep >= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  currentStep > step ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register("firstName", { required: "Required" })}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register("lastName", { required: "Required" })}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email",
                        },
                      })}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone", { required: "Required" })}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      {...register("dob", { required: "Required" })}
                      className={errors.dob ? "border-red-500" : ""}
                    />
                    {errors.dob && (
                      <p className="text-sm text-red-500 mt-1">{errors.dob.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ssn">Social Security Number *</Label>
                    <Input
                      id="ssn"
                      type="password"
                      placeholder="XXX-XX-XXXX"
                      {...register("ssn", { required: "Required" })}
                      className={errors.ssn ? "border-red-500" : ""}
                    />
                    {errors.ssn && (
                      <p className="text-sm text-red-500 mt-1">{errors.ssn.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="driverLicense">Driver License Number *</Label>
                    <Input
                      id="driverLicense"
                      {...register("driverLicense", { required: "Required" })}
                      className={errors.driverLicense ? "border-red-500" : ""}
                    />
                    {errors.driverLicense && (
                      <p className="text-sm text-red-500 mt-1">{errors.driverLicense.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dlState">License State *</Label>
                    <Input
                      id="dlState"
                      placeholder="GA"
                      maxLength={2}
                      {...register("dlState", { required: "Required" })}
                      className={errors.dlState ? "border-red-500" : ""}
                    />
                    {errors.dlState && (
                      <p className="text-sm text-red-500 mt-1">{errors.dlState.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      {...register("street", { required: "Required" })}
                      className={errors.street ? "border-red-500" : ""}
                    />
                    {errors.street && (
                      <p className="text-sm text-red-500 mt-1">{errors.street.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        {...register("city", { required: "Required" })}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="GA"
                        maxLength={2}
                        {...register("state", { required: "Required" })}
                        className={errors.state ? "border-red-500" : ""}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="zipcode">ZIP Code *</Label>
                      <Input
                        id="zipcode"
                        {...register("zipcode", { required: "Required" })}
                        className={errors.zipcode ? "border-red-500" : ""}
                      />
                      {errors.zipcode && (
                        <p className="text-sm text-red-500 mt-1">{errors.zipcode.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Employment & Housing */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Employment & Housing</CardTitle>
                <CardDescription>Your financial information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employer">Employer Name *</Label>
                      <Input
                        id="employer"
                        {...register("employer", { required: "Required" })}
                        className={errors.employer ? "border-red-500" : ""}
                      />
                      {errors.employer && (
                        <p className="text-sm text-red-500 mt-1">{errors.employer.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        {...register("jobTitle", { required: "Required" })}
                        className={errors.jobTitle ? "border-red-500" : ""}
                      />
                      {errors.jobTitle && (
                        <p className="text-sm text-red-500 mt-1">{errors.jobTitle.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="employmentYears">Years at Job *</Label>
                      <Input
                        id="employmentYears"
                        type="number"
                        min="0"
                        step="0.1"
                        {...register("employmentYears", {
                          required: "Required",
                          valueAsNumber: true,
                        })}
                        className={errors.employmentYears ? "border-red-500" : ""}
                      />
                      {errors.employmentYears && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.employmentYears.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="monthlyIncome">Monthly Income ($) *</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("monthlyIncome", {
                          required: "Required",
                          valueAsNumber: true,
                        })}
                        className={errors.monthlyIncome ? "border-red-500" : ""}
                      />
                      {errors.monthlyIncome && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.monthlyIncome.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Housing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="housingStatus">Housing Status *</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("housingStatus", value as "own" | "rent" | "other")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own">Own</SelectItem>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="monthlyPayment">Monthly Payment ($) *</Label>
                      <Input
                        id="monthlyPayment"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("monthlyPayment", {
                          required: "Required",
                          valueAsNumber: true,
                        })}
                        className={errors.monthlyPayment ? "border-red-500" : ""}
                      />
                      {errors.monthlyPayment && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.monthlyPayment.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="yearsAtAddress">Years at Address *</Label>
                      <Input
                        id="yearsAtAddress"
                        type="number"
                        min="0"
                        step="0.1"
                        {...register("yearsAtAddress", {
                          required: "Required",
                          valueAsNumber: true,
                        })}
                        className={errors.yearsAtAddress ? "border-red-500" : ""}
                      />
                      {errors.yearsAtAddress && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.yearsAtAddress.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Equipment & References */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Equipment & References</CardTitle>
                <CardDescription>What you're looking to finance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Equipment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="equipmentType">Equipment Type *</Label>
                      <Select
                        onValueChange={(value) => setValue("equipmentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utility">Utility Trailer</SelectItem>
                          <SelectItem value="dump">Dump Trailer</SelectItem>
                          <SelectItem value="enclosed">Enclosed Trailer</SelectItem>
                          <SelectItem value="gooseneck">Gooseneck Trailer</SelectItem>
                          <SelectItem value="car_hauler">Car Hauler</SelectItem>
                          <SelectItem value="flatbed">Flatbed Trailer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="requestedAmount">Requested Amount ($) *</Label>
                      <Input
                        id="requestedAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("requestedAmount", {
                          required: "Required",
                          valueAsNumber: true,
                        })}
                        className={errors.requestedAmount ? "border-red-500" : ""}
                      />
                      {errors.requestedAmount && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.requestedAmount.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="requestedTerm">Term (months) *</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("requestedTerm", parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select term..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="equipmentDesc">Equipment Description</Label>
                    <Textarea
                      id="equipmentDesc"
                      {...register("equipmentDesc")}
                      placeholder="Describe the equipment you're interested in..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">References</h3>
                  <p className="text-sm text-gray-600">
                    Please provide two personal or professional references
                  </p>

                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Reference 1</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ref1Name">Name *</Label>
                        <Input
                          id="ref1Name"
                          {...register("ref1Name", { required: "Required" })}
                          className={errors.ref1Name ? "border-red-500" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ref1Phone">Phone *</Label>
                        <Input
                          id="ref1Phone"
                          type="tel"
                          {...register("ref1Phone", { required: "Required" })}
                          className={errors.ref1Phone ? "border-red-500" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ref1Relationship">Relationship *</Label>
                        <Input
                          id="ref1Relationship"
                          {...register("ref1Relationship", { required: "Required" })}
                          className={errors.ref1Relationship ? "border-red-500" : ""}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Reference 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ref2Name">Name *</Label>
                        <Input
                          id="ref2Name"
                          {...register("ref2Name", { required: "Required" })}
                          className={errors.ref2Name ? "border-red-500" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ref2Phone">Phone *</Label>
                        <Input
                          id="ref2Phone"
                          type="tel"
                          {...register("ref2Phone", { required: "Required" })}
                          className={errors.ref2Phone ? "border-red-500" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ref2Relationship">Relationship *</Label>
                        <Input
                          id="ref2Relationship"
                          {...register("ref2Relationship", { required: "Required" })}
                          className={errors.ref2Relationship ? "border-red-500" : ""}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Legal & Signature */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Legal Authorization & Signature</CardTitle>
                <CardDescription>Review and sign to submit your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-line">{LEGAL_TEXT}</p>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="legalConsent"
                    checked={legalConsent}
                    onCheckedChange={(checked) =>
                      setValue("legalConsent", checked as boolean)
                    }
                  />
                  <Label htmlFor="legalConsent" className="text-sm cursor-pointer">
                    I have read and agree to the terms and conditions stated above *
                  </Label>
                </div>

                <div>
                  <Label className="text-base font-semibold">Your Signature *</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    By signing below, you certify that all information is accurate and authorize
                    the credit check.
                  </p>
                  <SignaturePad ref={signatureRef} />
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">{submitError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
        >
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button type="button" onClick={nextStep}>
            Next Step
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting || !legalConsent}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
