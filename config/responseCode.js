module.exports = {
  returnCode: {
    validEmail: 101, //User email id is success, this account valid check
    accountSuspended: 102, //User account is suspended/ deactivated, Need to activate
    emailNotFound: 103, //User email id not found / wrong email id
    passwordMismatch: 104, //Password is mismatch
    passwordMatched: 105, //Password matched
    passwordLimitExceeded: 107, //Exceeded password, (Wrong password more than limited number)
    invalidSession: 108, //Session is not valid,not authenticated, relogin to generate new session and associate
    validSession: 109, //sucess, Valid session, data found, result found etc...
    exceededpasswordAttempt: 116,
    invalidToken: 118,
    newPasswordGenerated: 119,
    success: 100, //	Success
    error: 600, //	Exception / server errror
  },
};
