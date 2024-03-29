import { IPost, IComment } from "../utils/types";
import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../App";
import Comment from "./Comment";
import handleDelete from "../utils/handleDelete";

//Maybe change postToDisplay and idPostToDisplay if theyre confusing
interface IProps {
  postToDisplay: IPost;
  setPageToDisplay: React.Dispatch<React.SetStateAction<string>>;
  setIdPostToDisplay: React.Dispatch<React.SetStateAction<number>>;
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
}

export default function IndividualPostPage({
  postToDisplay,
  setPageToDisplay,
  setIdPostToDisplay,
  setPosts,
}: IProps): JSX.Element {
  const commentPlaceholder = {
    comment: "",
    comment_id: NaN,
    time: "",
    post_id: 0,
  };

  const [commentList, setCommentList] = useState<IComment[]>([]);
  const [typeComment, setTypeComment] = useState<string>("");
  const [createOrEdit, setCreateOrEdit] = useState<{
    postOrPut: 0 | 1;
    comment: IComment;
  }>({ postOrPut: 0, comment: commentPlaceholder });

  useEffect(() => {
    async function getComments(): Promise<void> {
      const dbres: IComment[] = (
        await axios.get(`${url}/${postToDisplay.id}/comments`)
      ).data.data;
      setCommentList(dbres);
    }
    if (!isNaN(postToDisplay.id)) {
      getComments();
    }
  }, [postToDisplay]);

  function backToHomepage(): void {
    setPageToDisplay("homepage");
    setIdPostToDisplay(NaN);
  }

  async function addComment(): Promise<void> {
    if (createOrEdit.postOrPut === 0) {
      await axios.post(`${url}/${postToDisplay.id}/comments`, {
        comment: typeComment,
      });
      const dbres: IComment[] = (
        await axios.get(`${url}/${postToDisplay.id}/comments`)
      ).data.data;
      setCommentList(dbres);
      setTypeComment("");
    } else {
      await axios.put(
        `${url}/${createOrEdit.comment.post_id}/comments/${createOrEdit.comment.comment_id}`,
        { comment: typeComment }
      );
      const dbres: IComment[] = (
        await axios.get(`${url}/${createOrEdit.comment.post_id}/comments`)
      ).data.data;
      setCommentList(dbres);
      setCreateOrEdit({ postOrPut: 0, comment: commentPlaceholder });
      setTypeComment("");
    }
  }

  async function handleClickDelete(): Promise<void> {
    const updatedData = await handleDelete(postToDisplay.id);
    setPosts(updatedData);
    setPageToDisplay("homepage");
  }
  return (
    <div>
      <p>{postToDisplay.title}</p>
      <p>{postToDisplay.message}</p>
      <p>{postToDisplay.post_date.slice(0, 10)}</p>
      <button onClick={handleClickDelete}>Delete Post</button>
      <div className="all-comments">
        {commentList.map((comment) => (
          <Comment
            key={comment.comment_id}
            commentData={comment}
            setCommentList={setCommentList}
            setTypeComment={setTypeComment}
            setCreateOrEdit={setCreateOrEdit}
          />
        ))}
      </div>
      <input
        onChange={(e) => setTypeComment(e.target.value)}
        value={typeComment}
        placeholder="Add comment!"
      />
      <button onClick={addComment}>Submit</button>
      <button onClick={backToHomepage}>Homepage</button>
    </div>
  );
}
