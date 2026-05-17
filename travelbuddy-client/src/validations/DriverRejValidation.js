import * as yup from "yup";

const driverRegValidationSchema = yup.object().shape({
  driverName: yup
    .string()
    .required("Driver name is required"),

  driverEmail: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  driverPhone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^(9|7|2)\d{7}$/,
      "Invalid Omani phone number (must be 8 digits)"
    ),

  licenseNumber: yup
    .string()
    .required("Driving license number is required"),

  taxiPermitNumber: yup
    .string()
    .required("Taxi permit number is required"),

  vehicleModel: yup
    .string()
    .required("Vehicle model is required"),

  plateNumber: yup
    .string()
    .required("Vehicle plate number is required"),

  nationalId: yup
    .string()
    .required("National ID is required"),

  experienceYears: yup
    .string()
    .required("Years of experience is required")
    .test("valid-number", "Experience must be a valid number", (val) => val !== "" && !isNaN(Number(val)))
    .test("min-zero", "Experience cannot be negative", (val) => Number(val) >= 0),

  driverPassword: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain uppercase, lowercase, number and special character"
    ),

  cnfPwd: yup
    .string()
    .oneOf([yup.ref("driverPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default driverRegValidationSchema;