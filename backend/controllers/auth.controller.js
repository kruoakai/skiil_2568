const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const usersRepo = require("../repositories/users");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    console.log("body", req.body);
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "email and password required" });
    const user = await usersRepo.findByEmail(email);
    // ตรวจสอบ user และ password  ค้นหาผู้ใช้จากฐานข้อมูลโดยใช้ email ที่ให้มา  ถ้าไม่พบผู้ใช้ ให้ส่งรหัสสถานะ 401 พร้อมข้อความแสดงข้อผิดพลาด
    // ถ้าพบผู้ใช้ ให้ตรวจสอบรหัสผ่านที่ให้มาโดยใช้ bcrypt.compare ถ้ารหัสผ่านไม่ตรงกัน ให้ส่งรหัสสถานะ 401 พร้อมข้อความแสดงข้อผิดพลาด
    // ถ้ารหัสผ่านตรงกัน ให้สร้าง JWT โดยใช้ jwt.sign  payload ของโทเค็นควรมี id, role, name ของผู้ใช้ ใช้ความลับจากตัวแปร ENV  JWT_SECRET
    // ตั้งค่า expiresIn เป็นค่าจากตัวแปร ENV  JWT_EXPIRES หรือ "1h" เป็นค่าเริ่มต้น ส่งการตอบกลับที่มี success: true, accessToken, และข้อมูลผู้ใช้ (id, name, email, role) กลับไปยังไคลเอนต์
    // (อย่าส่งรหัสผ่านกลับไปยังไคลเอนต์)  // (อย่าส่งโทเค็นกลับไปยังไคลเอนต์ในรูปแบบของ token)  // (ถ้าอยากส่งโทเค็นกลับไปยังไคลเอนต์ ให้ใช้ accessToken แทน)
    // (ถ้าอยากส่งข้อความกลับไปยังไคลเอนต์ ให้ใช้ message แทน)
    console.log("user", user);
    if (!user)
      return res
        .status(401) // หมายเหตุ: เปลี่ยนจาก 400 เป็น 401 เพื่อความถูกต้อง 401 Unauthorized เหมาะสมกว่า 400 Bad Request
        .json({ success: false, message: "Invalid credentials-email" });
    const ok = await bcrypt.compare(password, user.password_hash);
    console.log("password match?", ok);
    if (!ok)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials-password" });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    // return res.json({ success:true, accessToken: token, user:{ id: user.id, name: user.name, email: user.email, role: user.role } });
    // (ถ้าอยากส่ง token กลับไปใน response body ให้ใช้ accessToken แทน)  (ถ้าอยากส่ง message กลับไปใน response body ให้ใช้ message แทน)
    // ส่งการตอบกลับที่มี success: true, accessToken, และข้อมูลผู้ใช้ (id, name, email, role) กลับไปยังไคลเอนต์
    res.json({
      success: true,
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      //   message: 'Login successful',
      //   token, // ไม่ควรส่ง token กลับไปใน response body
      //   user: { id: user.id, name: user.name, email: user.email, role: user.role }

    });
  } catch (e) {
    next(e);
    // next(new Error('test error'));
    // res.status(500).json({ success:false, message: e.message || 'Server error' }); //throw e; // (อย่าใช้ res แล้วตามด้วย next(e) เพราะจะส่ง response 2 ครั้ง
    // 1 ครั้งจาก res และ 1 ครั้งจาก next(e) จะ error)  // (อย่าใช้ throw e เพราะจะไม่ถูกจับที่ express error handler)  // (ใช้ next(e) อย่างเดียว เพราะจะถูกจับที่ express error handler)
    // (อย่าใช้ res.status(500).json(...) เพราะจะไม่ถูกจับที่ express error handler)     // (อย่าใช้ next(new Error(...)) เพราะจะไม่ส่ง message ไปยัง client)
    // (ใช้ next(e) อย่างเดียว เพราะจะส่ง message ไปยัง client ถ้าเป็น instance ของ Error)    // (ถ้าอยากซ่อน message จาก client ให้ใช้ next(new Error('Server error')) แทน)
    //  (ถ้าอยาก log error เพิ่มเติม ให้ใช้ console.error(e) ก่อน next(e))     // (ถ้าอยากส่ง response 500 โดยไม่ใช้ express error handler ให้ใช้ res.status(500).json(...) แทน next(e))
    // (แต่ไม่แนะนำ เพราะจะทำให้ code ซ้ำซ้อน และไม่สามารถจัดการ error ได้ในที่เดียว)
  }
};
