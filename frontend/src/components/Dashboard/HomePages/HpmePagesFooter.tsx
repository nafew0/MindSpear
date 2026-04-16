import React from 'react'
import { TiSocialFacebook } from "react-icons/ti";
import { IoLogoYoutube } from "react-icons/io5";
import { AiOutlineGoogle } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";

function HpmePagesFooter() {
	return (
		<div className='py-[30px] bg-[#f2f1f0] mt-[50px] flex flex-col items-center justify-center'>
			<div className='flex gap-4 pb-[10px]'>
				<div className='cursor-pointer w-[40px] h-[40px] flex justify-center items-center rounded-full border border-[#222]'>
					<TiSocialFacebook className='text-[24px]' />
				</div>
				<div className='cursor-pointer w-[40px] h-[40px] flex justify-center items-center rounded-full border border-[#222]'>
					<IoLogoYoutube className='text-[24px]' />
				</div>
				<div className='cursor-pointer w-[40px] h-[40px] flex justify-center items-center rounded-full border border-[#222]'>
					<AiOutlineGoogle className='text-[24px]' />
				</div>
				<div className='cursor-pointer w-[40px] h-[40px] flex justify-center items-center rounded-full border border-[#222]'>
					<FaXTwitter className='text-[24px]' />
				</div>
			</div>
			<h2> Copyright © 2025 MindSpear. All Rights Reserved. </h2>
		</div>
	)
}

export default HpmePagesFooter
