const { body, validationResult } = require("express-validator");

/**
 * Middleware helper to evaluate validation results and return formatted 400 errors.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.status(400).json({ message: firstError, errors: errors.array() });
  }
  next();
};

// -------------------------------------------------------------
// Auth Validators (Admin / Staff)
// -------------------------------------------------------------

exports.validateRegister = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address format")
    .normalizeEmail(),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("Username can only contain letters, numbers, dots, underscores, and hyphens"),
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "staff"])
    .withMessage("Role must be admin or staff"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  handleValidationErrors,
];

exports.validateLogin = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

exports.validateCreateStaff = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "staff"])
    .withMessage("Role must be admin or staff"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

// -------------------------------------------------------------
// Student Auth Validators
// -------------------------------------------------------------

exports.validateStudentLogin = [
  (req, res, next) => {
    const id = req.body.schoolId || req.body.identifier;
    if (!id || typeof id !== "string" || !id.trim()) {
      return res.status(400).json({ message: "School ID is required" });
    }
    next();
  },
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

// -------------------------------------------------------------
// Password Reset & Change Validators
// -------------------------------------------------------------

exports.validateForgotPassword = [
  (req, res, next) => {
    const hasEmail = req.body.email && typeof req.body.email === "string" && req.body.email.trim();
    const hasStudentId = req.body.studentId || req.body.schoolId;
    if (!hasEmail && !hasStudentId) {
      return res.status(400).json({ message: "Email or School ID is required" });
    }
    next();
  },
  handleValidationErrors,
];

exports.validateVerifyResetCode = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Reset code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 digits")
    .isNumeric()
    .withMessage("Reset code must contain digits only"),
  handleValidationErrors,
];

exports.validateResetPassword = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Reset code is required"),
  (req, res, next) => {
    if (!req.body.newPassword && req.body.password) {
      req.body.newPassword = req.body.password;
    }
    next();
  },
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  handleValidationErrors,
];

exports.validateChangePassword = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New passwords do not match");
      }
      return true;
    }),
  handleValidationErrors,
];

// -------------------------------------------------------------
// Profile Update Validators
// -------------------------------------------------------------

exports.validateUpdateProfile = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("Username can only contain letters, numbers, dots, underscores, and hyphens"),
  handleValidationErrors,
];
