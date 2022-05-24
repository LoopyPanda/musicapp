import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { RESPONSE_LIMIT_DEFAULT } from "next/dist/server/api-utils";
import { userInfo } from "os";
import cookie from "cookie";
import prisma from "../../lib/prisma";
import { Switch } from "@chakra-ui/react";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const salt = bcrypt.genSaltSync();
  const { email, password } = req.body;

  let user;
  //user will create or enter email and password
  try {
    user = await prisma.user.create({
      data: {
        email,
        password: bcrypt.hashSync(password, salt),
      },
    });
    //if they already have an account then will go to catch
  } catch (e) {
    res.status(401);
    res.json({ error: "User already exists" });
    return;
  }
  //if they suceesfully sign up then our token will create and it will be really big string and check is this person is authoried or not
  const token = Jwt.sign(
    {
      email: user.email,
      id: user.id,
      time: Date.now(),
    },
    "hello",
    { expiresIn: "8h" }
  );

  //then create a cookies
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("LOOPYTUNES_ACCESS-TOKEN", token, {
      //it will only access http
      httpOnly: true,
      // it will be 8 hr beacuse it's in milisecond
      maxAge: 8 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  );

  // then we return to the user
  res.json(user);
};
