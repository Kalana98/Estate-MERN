import asyncHandler from "express-async-handler";
import Prisma from "../config/prismaConfig.js";

//function to creating an user
export const createUser = asyncHandler(async (req, res) => {
  console.log("Creating a user");

  let { email } = req.body;

  try {
    const userExists = await Prisma.user.findUnique({ where: { email: email } });

    if (!userExists) {
      const user = await Prisma.user.create({ data: req.body });
      res.status(201).json({
        message: "User registered successfully",
        user: user,
      });
    } else {
      res.status(201).json({ message: "User already registered" });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//function to book a visit to resd
export const bookVisit = asyncHandler(async(req, res) => {
  const {email, date} = req.body
  const {id} = req.params

  try{
    const user = await Prisma.user.findUnique({
      where: {email: email}
    })
     const alreadyBooked = user.bookedVisits.filter(v => v.date == date)[0];
     console.log(alreadyBooked)
    
    if(alreadyBooked){
      res.status(400).json({message: "This residency is already booked by you"})
    }else{
      await Prisma.user.update({
        where: {email: email},
        data: {
          bookedVisits: {push: {id, date}}
        }
      })
      res.send("your visit is booked successfully")

    }
  }catch(err){
    console.log(err)
    throw new Error(err.message)
  }
})

//function to get all bookings of a user
export const getAllBookings = asyncHandler(async(req, res) => {
  const {email} = req.body
  try{
    const bookings = await Prisma.user.findUnique({
      where: {email},
      select: {bookedVisits: true}
    })
    res.status(200).send(bookings)
  }catch(err){
    throw new Error(err.message);
  }
})

//function to cancel the booking
export const cancelBooking = asyncHandler(async(req, res) => {
  const {email} = req.body;
  const {id}= req.params
  try{
    const user = await Prisma.user.findUnique({
      where: {email : email},
      select: {bookedVisits: true}
    })

    const index = user.bookedVisits.findIndex((visit)=> visit.id === id)

    if(index === -1){
      res.status(404).json({message: "booking not found"})
    }else{
      user.bookedVisits.splice(index, 1)
      await Prisma.user.update({
        where: {email},
        data: {
          bookedVisits: user.bookedVisits
        }
      })
      res.send("Booking cancelled successfully")
    }
  }catch(err){
    throw new Error(err.message);
  }
})

//function to add a resd in favourite list of a user
export const toFav = asyncHandler(async(req, res)=> {
  const {email} = req.body;
  const {rid} = req.params;

  try{
    const user = await Prisma.user.findUnique({
      where: {email}
    })

    if(user.favResidenciesIsiD.includes(rid)){
      const updateUser = await Prisma.user.update({
        where: {email},
        data: {
          favResidenciesIsiD : {
            set: user.favResidenciesIsiD.filter((id)=> id != rid)
          }
        }
      });
      res.send({message: "Removed from favorites", user: updateUser})
    }else{
      const updateUser = await Prisma.user.update({
        where: {email},
        data: {
          favResidenciesIsiD: {
            push: rid
          }
        }
      })
      res.send({message: "Updated favorites", user: updateUser})
    }
  }catch(err){
    throw new Error(err.message);
  }
})

//function to get all favorites
export const getAllFavorites = asyncHandler(async(req, res) => {
  const {email}= req.body;
  try{
    const favResd = await Prisma.user.findUnique({
      where: {email},
      select: {
        favResidenciesIsiD: true
      },
    });
    res.status(200).send(favResd)
  }catch(err){
    throw new Error(err.message);
  }
})