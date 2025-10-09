type FormType = "sign-in" | "sign-up";

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}


interface User {
  name: string;
  email: string;
  id: string;
}