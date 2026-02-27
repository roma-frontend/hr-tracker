import { TourStep } from "./OnboardingTour";

export const loginTourSteps: TourStep[] = [
  {
    target: "#login-card",
    title: "👋 Welcome!",
    description: "Let's show you around quickly!",
    placement: "center",
    highlight: false,
  },
  {
    target: "#biometric-login",
    title: "🔐 Quick Login",
    description: "Use fingerprint for faster access",
    placement: "bottom",
    highlight: true,
  },
  {
    target: "#email-login-form",
    title: "📧 Email Login",
    description: "Sign in with email & password",
    placement: "right",
    highlight: true,
  },
  {
    target: "#join-team-link",
    title: "👥 Join Team",
    description: "Request to join existing organization",
    placement: "top",
    highlight: true,
  },
  {
    target: "#create-org-link",
    title: "🏢 New Org",
    description: "Create your own organization",
    placement: "top",
    highlight: true,
  },
  {
    target: "#login-card",
    title: "🎉 Ready!",
    description: "Choose your option and get started!",
    placement: "center",
    highlight: false,
  },
];
