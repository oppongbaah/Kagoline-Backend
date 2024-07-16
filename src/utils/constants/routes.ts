export class ApplicationRoutes {
    public static readonly adminRoute = "/admin";
    public static readonly signupRoute = "/signup";
    public static readonly loginRoute = "/login";
    public static readonly enableMfaRoute = "/mfa/enable";
    public static readonly disableMfaRoute = "/mfa/disable";
    public static readonly confirmEmailRoute = `/email/confirmation`;
    public static readonly facebookLoginRoute = "/auth/facebook";
    public static readonly facebookCallbackRoute = "/auth/facebook/callback";
    public static readonly googleLoginRoute = "/auth/google";
    public static readonly googleCallbackRoute = "/auth/google/callback";
    public static readonly failureRoute = "/auth/error";
    public static readonly successRoute = "/auth";
    public static readonly totpRegisterRoute = "/auth/register_totp";
    public static readonly totpVerifyRoute ="/auth/verify_totp";
    public static readonly totpValidateRoute ="/auth/validate_totp";
}
