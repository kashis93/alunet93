import { useState } from "react";
import { ThumbsUp, Star, Mail, ArrowLeft } from "lucide-react";
import CommentSection from "./CommentSection";

const StartupDetails = ({ startup, goBack }) => {

const [upvotes,setUpvotes]=useState(startup.upvotes);
const [interested,setInterested]=useState(startup.interested);

const [isUpvoted,setIsUpvoted]=useState(false);
const [isInterested,setIsInterested]=useState(false);

const handleUpvote=()=>{
setUpvotes(isUpvoted ? upvotes-1 : upvotes+1);
setIsUpvoted(!isUpvoted);
};

const handleInterested=()=>{
setInterested(isInterested ? interested-1 : interested+1);
setIsInterested(!isInterested);
};

const sections = startup.description.split("\n\n");

return(

<div className="container mx-auto px-6 py-10 max-w-6xl">

<button
onClick={goBack}
className="flex items-center gap-2 text-gray-600 mb-6"
>
<ArrowLeft size={18}/>
Back
</button>

{/* IMAGE */}

<img
src={startup.poster}
className="w-full h-80 object-cover rounded-2xl shadow"
/>

<h1 className="text-4xl font-bold mt-6">
{startup.title}
</h1>

<div className="flex items-center gap-2 mt-3">

<img
src={`https://ui-avatars.com/api/?name=${startup.founder}&background=random`}
className="w-8 h-8 rounded-full"
/>

<p className="text-blue-600">
{startup.founder}
</p>

</div>

{/* DESCRIPTION */}

<div className="mt-10 space-y-10">

{sections.map((section,index)=>{

const [title,...content] = section.split(":");
const text = content.join(":");

if(title.includes("Key Features")){

const features = text.split("•");

return(

<div key={index}>

<h2 className="text-2xl font-bold mb-4">
Key Features
</h2>

<div className="grid md:grid-cols-2 gap-4">

{features.map((f,i)=>{

if(!f.trim()) return null;

return(

<div
key={i}
className="bg-gray-50 border p-4 rounded-lg shadow-sm"
>

{f}

</div>

);

})}

</div>

</div>

);

}

return(

<div key={index}>

<h2 className="text-2xl font-bold mb-2">
{title}
</h2>

<p className="text-gray-700 text-lg leading-relaxed">
{text}
</p>

</div>

);

})}

</div>

{/* STATS */}

<div className="grid grid-cols-3 gap-6 mt-12">

<div className="bg-gray-50 p-6 rounded-xl text-center">
<p className="text-2xl font-bold">{upvotes}</p>
<p className="text-gray-500 text-sm">Upvotes</p>
</div>

<div className="bg-gray-50 p-6 rounded-xl text-center">
<p className="text-2xl font-bold">{interested}</p>
<p className="text-gray-500 text-sm">Interested</p>
</div>

<div className="bg-gray-50 p-6 rounded-xl text-center">
<p className="text-2xl font-bold">{startup.needs.length}</p>
<p className="text-gray-500 text-sm">Needs</p>
</div>

</div>

{/* ACTION BUTTONS */}

<div className="flex gap-4 mt-8">

<button
onClick={handleUpvote}
className={`px-6 py-3 rounded-lg text-white ${
isUpvoted ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
}`}
>
<ThumbsUp size={18}/>
</button>

<button
onClick={handleInterested}
className={`px-6 py-3 rounded-lg text-white ${
isInterested ? "bg-yellow-600" : "bg-yellow-500 hover:bg-yellow-600"
}`}
>
<Star size={18}/>
</button>

<button
onClick={()=>window.location.href=`mailto:founder@startup.com?subject=Interested in ${startup.title}`}
className="px-6 py-3 rounded-lg bg-green-600 text-white"
>
<Mail size={18}/>
</button>

</div>

{/* COMMENTS */}

<div className="mt-16">

<CommentSection startup={startup}/>

</div>

</div>

);

};

export default StartupDetails;