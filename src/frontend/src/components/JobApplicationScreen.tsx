import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { playMenuClick } from "@/game/sounds";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface JobApplicationScreenProps {
  onBack: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  age: string;
  fightingMove: string;
  experience: string;
  whyJoin: string;
  resume: File | null;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  age?: string;
  fightingMove?: string;
  experience?: string;
  whyJoin?: string;
}

const GOLD = "#D8C38A";

export default function JobApplicationScreen({
  onBack,
}: JobApplicationScreenProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    age: "",
    fightingMove: "",
    experience: "",
    whyJoin: "",
    resume: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email.";
    }
    if (!formData.age.trim()) {
      newErrors.age = "Age is required.";
    } else if (Number(formData.age) < 1 || Number(formData.age) > 120) {
      newErrors.age = "Please enter a valid age.";
    }
    if (!formData.fightingMove.trim())
      newErrors.fightingMove = "Tell us your signature move.";
    if (!formData.experience)
      newErrors.experience = "Please select your experience level.";
    if (!formData.whyJoin.trim())
      newErrors.whyJoin = "Please tell us why you want to join.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    playMenuClick();
    const submission = {
      fullName: formData.fullName,
      email: formData.email,
      age: formData.age,
      fightingMove: formData.fightingMove,
      experience: formData.experience,
      whyJoin: formData.whyJoin,
      submittedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(
      localStorage.getItem("jobApplications") || "[]",
    );
    existing.push(submission);
    localStorage.setItem("jobApplications", JSON.stringify(existing));
    setSubmitted(true);
  };

  const fieldStyle = {
    background: "rgba(216,195,138,0.06)",
    border: "1px solid rgba(216,195,138,0.25)",
    color: GOLD,
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{ background: "#0d0d0f" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(216,195,138,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg px-4 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            data-ocid="jobapp.back_button"
            variant="ghost"
            onClick={() => {
              playMenuClick();
              onBack();
            }}
            className="mb-6 text-sm font-bold tracking-widest"
            style={{ color: "rgba(216,195,138,0.6)" }}
          >
            ← Back to Menu
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              {/* Title */}
              <div className="text-center mb-8">
                <motion.h1
                  className="text-3xl font-black tracking-tight"
                  style={{
                    color: GOLD,
                    textShadow:
                      "0 0 40px rgba(216,195,138,0.5), 0 0 80px rgba(216,195,138,0.2)",
                  }}
                  animate={{
                    textShadow: [
                      "0 0 30px rgba(216,195,138,0.4)",
                      "0 0 60px rgba(216,195,138,0.7)",
                      "0 0 30px rgba(216,195,138,0.4)",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  STICK FIGHT ARENA
                </motion.h1>
                <p
                  className="text-sm font-bold tracking-[0.35em] uppercase mt-1"
                  style={{ color: "rgba(216,195,138,0.5)" }}
                >
                  — JOBS —
                </p>
                <p
                  className="mt-3 text-xs"
                  style={{ color: "rgba(216,195,138,0.4)" }}
                >
                  Think you have what it takes to join the arena? Prove it.
                </p>
              </div>

              {/* Divider */}
              <div
                className="w-full h-px mb-8"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(216,195,138,0.3), transparent)",
                }}
              />

              <form
                onSubmit={handleSubmit}
                data-ocid="jobapp.form"
                className="flex flex-col gap-5"
                noValidate
              >
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="fullName"
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: GOLD }}
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    data-ocid="jobapp.input"
                    placeholder="e.g. Shadow McPunch"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, fullName: e.target.value }))
                    }
                    style={fieldStyle}
                    className="placeholder:text-[rgba(216,195,138,0.3)] focus-visible:ring-[rgba(216,195,138,0.4)]"
                  />
                  {errors.fullName && (
                    <p
                      data-ocid="jobapp.error_state"
                      className="text-xs"
                      style={{ color: "#e05050" }}
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: GOLD }}
                  >
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    data-ocid="jobapp.input"
                    placeholder="fighter@arena.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    style={fieldStyle}
                    className="placeholder:text-[rgba(216,195,138,0.3)] focus-visible:ring-[rgba(216,195,138,0.4)]"
                  />
                  {errors.email && (
                    <p
                      data-ocid="jobapp.error_state"
                      className="text-xs"
                      style={{ color: "#e05050" }}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="age"
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: GOLD }}
                  >
                    Age *
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    data-ocid="jobapp.input"
                    placeholder="18"
                    min={1}
                    max={120}
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, age: e.target.value }))
                    }
                    style={fieldStyle}
                    className="placeholder:text-[rgba(216,195,138,0.3)] focus-visible:ring-[rgba(216,195,138,0.4)]"
                  />
                  {errors.age && (
                    <p
                      data-ocid="jobapp.error_state"
                      className="text-xs"
                      style={{ color: "#e05050" }}
                    >
                      {errors.age}
                    </p>
                  )}
                </div>

                {/* Favorite Fighting Move */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="fightingMove"
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: GOLD }}
                  >
                    Favorite Fighting Move *
                  </Label>
                  <Input
                    id="fightingMove"
                    data-ocid="jobapp.input"
                    placeholder="e.g. Flying Uppercut"
                    value={formData.fightingMove}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        fightingMove: e.target.value,
                      }))
                    }
                    style={fieldStyle}
                    className="placeholder:text-[rgba(216,195,138,0.3)] focus-visible:ring-[rgba(216,195,138,0.4)]"
                  />
                  {errors.fightingMove && (
                    <p
                      data-ocid="jobapp.error_state"
                      className="text-xs"
                      style={{ color: "#e05050" }}
                    >
                      {errors.fightingMove}
                    </p>
                  )}
                </div>

                {/* Fighting Experience */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: GOLD }}
                  >
                    Fighting Experience *
                  </Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, experience: val }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="jobapp.select"
                      style={fieldStyle}
                      className="focus:ring-[rgba(216,195,138,0.4)]"
                    >
                      <SelectValue placeholder="Select your level…" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: "#1a1a1f",
                        border: "1px solid rgba(216,195,138,0.25)",
                        color: GOLD,
                      }}
                    >
                      <SelectItem value="beginner">🥋 Beginner</SelectItem>
                      <SelectItem value="intermediate">
                        ⚡ Intermediate
                      </SelectItem>
                      <SelectItem value="pro">🔥 Pro</SelectItem>
                      <SelectItem value="legend">💀 Legend</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience && (
                    <p
                      data-ocid="jobapp.error_state"
                      className="text-xs"
                      style={{ color: "#e05050" }}
                    >
                      {errors.experience}
                    </p>
                  )}
                </div>

                {/* Why Join */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="whyJoin"
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: GOLD }}
                  >
                    Why do you want to work at Stick Fight Arena? *
                  </Label>
                  <Textarea
                    id="whyJoin"
                    data-ocid="jobapp.textarea"
                    placeholder="Tell us your fighting spirit..."
                    rows={4}
                    value={formData.whyJoin}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, whyJoin: e.target.value }))
                    }
                    style={fieldStyle}
                    className="placeholder:text-[rgba(216,195,138,0.3)] focus-visible:ring-[rgba(216,195,138,0.4)] resize-none"
                  />
                  {errors.whyJoin && (
                    <p
                      data-ocid="jobapp.error_state"
                      className="text-xs"
                      style={{ color: "#e05050" }}
                    >
                      {errors.whyJoin}
                    </p>
                  )}
                </div>

                {/* Resume Upload */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="resume"
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: GOLD }}
                  >
                    Upload Resume{" "}
                    <span style={{ color: "rgba(216,195,138,0.4)" }}>
                      (optional)
                    </span>
                  </Label>
                  <label
                    htmlFor="resume"
                    data-ocid="jobapp.upload_button"
                    className="flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-all"
                    style={{
                      background: "rgba(216,195,138,0.04)",
                      border: "1px dashed rgba(216,195,138,0.3)",
                      color: "rgba(216,195,138,0.5)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLLabelElement).style.borderColor =
                        "rgba(216,195,138,0.6)";
                      (e.currentTarget as HTMLLabelElement).style.color = GOLD;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLLabelElement).style.borderColor =
                        "rgba(216,195,138,0.3)";
                      (e.currentTarget as HTMLLabelElement).style.color =
                        "rgba(216,195,138,0.5)";
                    }}
                  >
                    <span className="text-lg">📎</span>
                    <span className="text-xs font-medium">
                      {formData.resume
                        ? formData.resume.name
                        : "Click to attach your resume"}
                    </span>
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          resume: e.target.files?.[0] ?? null,
                        }))
                      }
                    />
                  </label>
                </div>

                {/* Divider */}
                <div
                  className="w-full h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(216,195,138,0.2), transparent)",
                  }}
                />

                {/* Submit */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    data-ocid="jobapp.submit_button"
                    className="w-full h-13 text-base font-black tracking-widest relative overflow-hidden"
                    style={{
                      background: "rgba(216,195,138,0.12)",
                      border: "1.5px solid #D8C38A",
                      color: GOLD,
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(216,195,138,0.2), transparent)",
                      }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />
                    📋 Submit Application
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 160,
                damping: 14,
              }}
              className="flex flex-col items-center text-center py-16 gap-6"
              data-ocid="jobapp.success_state"
            >
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                ✅
              </motion.div>
              <motion.h2
                className="text-3xl font-black tracking-tight"
                style={{
                  color: GOLD,
                  textShadow: "0 0 40px rgba(216,195,138,0.5)",
                }}
                animate={{
                  textShadow: [
                    "0 0 30px rgba(216,195,138,0.3)",
                    "0 0 70px rgba(216,195,138,0.7)",
                    "0 0 30px rgba(216,195,138,0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              >
                Application Received!
              </motion.h2>
              <p
                className="text-sm max-w-xs"
                style={{ color: "rgba(216,195,138,0.65)" }}
              >
                We&apos;ll be in touch soon, fighter. 💼
                <br />
                <br />
                May the best stick figure win this job.
              </p>
              <div
                className="w-32 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(216,195,138,0.4), transparent)",
                }}
              />
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button
                  data-ocid="jobapp.back_button"
                  onClick={() => {
                    playMenuClick();
                    onBack();
                  }}
                  className="h-12 px-8 font-bold tracking-widest"
                  style={{
                    background: "rgba(216,195,138,0.12)",
                    border: "1.5px solid #D8C38A",
                    color: GOLD,
                  }}
                >
                  ← Back to Menu
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
