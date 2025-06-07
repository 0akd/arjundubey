"use client";

import supabase from "@/config/supabase";
import Head from "next/head";
import { useParams } from "next/navigation"; // Use next/navigation for Next.js 13+
import { useEffect, useState } from "react";

interface Task {
  title: string;
  description: string;
  d:string;
}

const Edit = () => {


  const { id } = useParams();

  const [post, setPost] = useState<Task>({
    title: "",
    description: "",
    d:""
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (typeof id === "string") {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching task:", error.message);
          return;
        }

        if (data) {
          setPost(data);
        }
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  

  return (
    <>
      <div className="container mx-auto mt-8 max-w-[560px] bg-white p-4 rounded-lg min-h-60">
        <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-900 mb-4">
          <h1 className="text-3xl font-semibold">Edit Post</h1>
        </div>
        <form>
          <div className="mb-4">
            <label htmlFor="name">{post.title} </label>
   
          </div>
          <div className="mb-4">
            <label htmlFor="description">{post.description}</label>
            
          </div>
  
        </form>
      </div>
      <Head>
        <title>Edit Post</title>
      </Head>
    </>
  );
};

export default Edit;