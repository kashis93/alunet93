import React, { useState, useEffect } from "react";
import { postStatus } from "@/services/postsAPI";
import { format } from "date-fns";

import PostModal from "./PostModal";
import PostCard from "./PostCard";
import { uploadPostImage } from "@/services/imageUploadAPI";
import { Avatar, AvatarImage, AvatarFallback, Card, CardContent, Button } from "@/components/ui";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";

export default function CreatePost({ currentUser, allStatuses }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [status, setStatus] = useState("");
    const [currentPost, setCurrentPost] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [postImage, setPostImage] = useState("");

    const sendStatus = async () => {
        if (!status.trim() && !postImage) return toast.error("Post cannot be empty.");

        let object = {
            content: status,
            timeStamp: format(new Date(), "PPpp"),
            userEmail: currentUser.email,
            userName: currentUser.name || currentUser.displayName || "Unknown User",
            userPhotoURL: currentUser.photoURL || currentUser.imageLink || "",
            userHeadline: currentUser.headline || currentUser.role || "Alumni",
            postID: crypto.randomUUID(),
            userID: currentUser.uid || currentUser.id,
            postImage: postImage,
        };

        await postStatus(object);
        setModalOpen(false);
        setIsEdit(false);
        setStatus("");
        setPostImage("");
    };

    const getEditData = (posts) => {
        setModalOpen(true);
        setStatus(posts?.content || posts?.status);
        setCurrentPost(posts);
        setIsEdit(true);
    };

    return (
        <>
        <Card className="border-slate-200 shadow-sm rounded-lg overflow-hidden mb-4 bg-white">
            <CardContent className="p-4">
                <div className="flex gap-2 mb-2">
                    <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={currentUser?.photoURL || currentUser?.imageLink} alt={currentUser?.name} />
                        <AvatarFallback>{(currentUser?.name || currentUser?.displayName)?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <button
                        onClick={() => {
                            setModalOpen(true);
                            setIsEdit(false);
                        }}
                        className="flex-1 text-left px-4 py-3 rounded-full bg-white hover:bg-slate-100 transition-colors text-slate-500 font-semibold border border-slate-300"
                    >
                        Share your achievement, failure, experience, or success
                    </button>
                </div>

                <div className="flex justify-start pt-1">
                    <Button
                        variant="ghost"
                        className="h-10 px-4 text-slate-500 hover:bg-slate-100 font-semibold group"
                        onClick={() => { setModalOpen(true); setIsEdit(false); }}
                    >
                        <ImagePlus className="h-5 w-5 mr-2 text-sky-500" />
                        <span>Add photo</span>
                    </Button>
                </div>
            </CardContent>

            <PostModal
                setStatus={setStatus}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                status={status}
                sendStatus={sendStatus}
                isEdit={isEdit}
                updateStatus={() => {
                    import("@/services/postsAPI").then(({ updatePost }) => {
                        updatePost(currentPost.id, status, postImage);
                        setModalOpen(false);
                    });
                }}
                uploadPostImage={uploadPostImage}
                postImage={postImage}
                setPostImage={setPostImage}
                setCurrentPost={setCurrentPost}
                currentPost={currentPost}
            />
        </Card>
        <div className="space-y-4">
            {allStatuses?.map((post) => (
                <PostCard
                    key={post.id}
                    posts={post}
                    currentUser={currentUser}
                    getEditData={getEditData}
                />
            ))}
        </div>
    </>
    );
}
