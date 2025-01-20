import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from "../models/userModel";
// טוען משתנים מ-.env
dotenv.config();

// מגדיר את האסטרטגיה
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `http://localhost:3000/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const username = profile.displayName;

        if (!email) {
          return done(null, false, { message: 'Google profile does not provide email.' });
        }

        // בדוק אם המשתמש כבר קיים
        const userExists = await User.findOne({ email });
        const userExists_name = await User.findOne({ username });
        if (userExists) {
          // המשתמש כבר קיים - תחזור אליו
          return done(null, userExists);
        }
        if(userExists_name){
          return done(null, userExists_name);
        }

        // אם המשתמש לא קיים, צור משתמש חדש
        const newUser = new User({
          email,
          username,
          gender: "male",
          profileImage: "none",
          profileImageTop: "none",
          googleId: profile.id,
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        console.error('Error during Google authentication:', error);
        done(error, null);
      }
    }
  )
);

// סידור המידע בסשן (אופציונלי)
passport.serializeUser((user: any, done) => {
  done(null, user.id); // שומר רק את ה-id בסשן
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id); // מחפש את המשתמש לפי ה-id מהסשן
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
