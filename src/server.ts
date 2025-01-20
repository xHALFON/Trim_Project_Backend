import app from './index';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.NODE_ENV === 'production' ? 443 : 80;

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});