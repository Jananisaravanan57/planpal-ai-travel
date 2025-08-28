import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigation } from 'react-router-dom';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { FcGoogle } from "react-icons/fc";

function Header() {

  const user = JSON.parse(localStorage.getItem('user'));
  const [openDialog, setOpenDialog] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => GetUserProfile(tokenResponse),
    onError: (error) => console.log(error),
    // Remove flow: 'auth-code' to use implicit flow by default
  })
  const GetUserProfile = async (tokenResponse) => {
    try {
      // For implicit flow, use tokenResponse.access_token
      // For auth-code flow, the token would come from your backend
      const accessToken = tokenResponse.access_token || tokenResponse;

      const res = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          }
        }
      );

      console.log('User profile:', res.data);

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(res.data));

      // Close the dialog
      setOpenDialog(false);

      // Show success message
      toast.success(`Welcome ${res.data.name}!`);
      window.location.reload();

      return res.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error("Failed to get user profile. Please try again.");
    }
  };

  useEffect(() => {
    console.log(user);
  }, [])
  return (
    <div className='p-1 shadow-sm flex justify-between items-center px-2'>
      <img src='/logo.jpg' />
      <div >
        {user ? <div className='flex items-center gap-3'>
          <a href="/my-trips">
            <Button variant="outline" className='rounded-full'>My Trips</Button>
          </a>
          <Popover>
            <PopoverTrigger><img src={user?.picture} className='h-[30px] w-[30px] rounded-full' /></PopoverTrigger>
            <PopoverContent>
              <h2 className='cursor-pointer' onClick={() => {
                googleLogout();
                localStorage.clear();
                window.location.reload();
              }}
              >Logout</h2></PopoverContent>
          </Popover>
        </div> : <Button onClick={() => setOpenDialog(true)}>
          Sign In
        </Button>
        }

      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-gray-100 p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              Sign in securely using your Google account.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center text-center">
            <img src="/logo.jpg" alt="Logo" className="w-20 h-20  mb-8" />
            <h2 className="font-bold text-lg mt-4">Sign In with Google</h2>
            <p className="text-sm text-gray-600">
              Sign in to the app with Google authentication securely
            </p>

            <Button
              onClick={login}
              className="w-full mt-5 flex gap-3 items-center justify-center 
             bg-white hover:bg-gray-100 text-black font-medium border border-gray-300 py-2 rounded-lg"
              variant={null}
            >
              <FcGoogle className="h-6 w-6" />
              Sign in with Google
            </Button>


          </div>
        </DialogContent>
      </Dialog>



    </div>
  )
}

export default Header