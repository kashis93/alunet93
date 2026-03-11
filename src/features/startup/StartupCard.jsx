import { useState } from "react";
import { Rocket, ThumbsUp, Star, MessageCircle, Link } from "lucide-react";

const StartupCard = ({ startup, onClick }) => {

    const [upvotes, setUpvotes] = useState(startup.upvotes);
    const [interested, setInterested] = useState(startup.interested);

    const [isUpvoted, setIsUpvoted] = useState(false);
    const [isInterested, setIsInterested] = useState(false);

    const [requestSent, setRequestSent] = useState(false);

    /* NEW IDEA BADGE (24 hours) */

    const isNew = Date.now() - startup.id < 1000 * 60 * 60 * 24;

    /* UPVOTE */

    const handleUpvote = (e) => {

        e.stopPropagation();

        if (isUpvoted) {
            setUpvotes(upvotes - 1);
        } else {
            setUpvotes(upvotes + 1);
        }

        setIsUpvoted(!isUpvoted);

    };

    /* INTERESTED */

    const handleInterested = (e) => {

        e.stopPropagation();

        if (isInterested) {
            setInterested(interested - 1);
        } else {
            setInterested(interested + 1);
        }

        setIsInterested(!isInterested);

    };

    /* CONNECT */

    const handleConnect = (e) => {

        e.stopPropagation();

        setRequestSent(!requestSent);

    };

    return (

        <div
            onClick={onClick}
            className="group bg-white rounded-2xl overflow-hidden border shadow-md hover:shadow-xl transition cursor-pointer"
        >

            {/* IMAGE */}

            <div className="relative overflow-hidden">

                <img
                    src={startup.poster}
                    className="w-full h-48 object-cover group-hover:scale-110 transition duration-700"
                />

                {/* NEW BADGE */}

                {isNew && (

                    <span className="absolute top-3 left-3 text-xs bg-green-500 text-white px-2 py-1 rounded">
                        NEW
                    </span>

                )}

            </div>

            <div className="p-5">

                {/* TITLE */}

                <div className="flex items-center gap-2 mb-2">

                    <Rocket className="text-green-600" size={18} />

                    <h2 className="font-bold text-lg">
                        {startup.title}
                    </h2>

                </div>

                {/* FOUNDER */}

                <p
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-blue-600 font-medium cursor-pointer"
                >
                    🧑‍💻 {startup.founder}
                </p>

                {/* DESCRIPTION */}

                <p className="text-sm text-gray-600 mt-2">
                    {startup.description.slice(0, 90)}...
                </p>

                {/* NEEDS */}

                <div className="flex flex-wrap gap-2 mt-3">

                    {startup.needs.map((need, index) => (

                        <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                        >
                            {need}
                        </span>

                    ))}

                </div>

                {/* ACTION BAR */}

                <div className="flex justify-between items-center mt-4 border-t pt-3">

                    {/* UPVOTE */}

                    <button
                        onClick={handleUpvote}
                        className="flex items-center gap-1 text-gray-600"
                    >

                        <ThumbsUp
                            size={18}
                            className={isUpvoted ? "text-blue-600 fill-blue-600" : ""}
                        />

                        <span className={isUpvoted ? "font-bold text-blue-600" : ""}>
                            {upvotes}
                        </span>

                    </button>

                    {/* INTERESTED */}

                    <button
                        onClick={handleInterested}
                        className="flex items-center gap-1 text-gray-600"
                    >

                        <Star
                            size={18}
                            className={isInterested ? "text-yellow-500 fill-yellow-500" : ""}
                        />

                        <span className={isInterested ? "font-bold text-yellow-600" : ""}>
                            {interested}
                        </span>

                    </button>


                    {/* CONNECT */}

                    <button
                        onClick={handleConnect}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-white ${requestSent
                                ? "bg-gray-600"
                                : "bg-purple-600"
                            }`}
                    >

                        <Link size={16} />

                        {requestSent ? "Withdraw" : "Connect"}

                    </button>

                </div>

            </div>

        </div>

    );

};

export default StartupCard;