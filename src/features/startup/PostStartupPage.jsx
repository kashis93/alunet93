import { useState } from "react";
import { uploadPostImage } from "@/services/imageUploadAPI.js";
import { addStartup } from "@/services/dataService";
import { notifyConnectedAlumni } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";

const stages = [
  "Idea Phase",
  "Prototype / MVP",
  "Early Traction",
  "Scaling"
];

const sectors = [
  "SaaS",
  "FinTech",
  "EdTech",
  "HealthTech",
  "E-commerce",
  "CleanTech",
  "Other"
];

const needsList = [
  "Team",
  "Funding",
  "Mentorship"
];

const PostStartupPage = ({ addStartup: localAddStartup, goBack }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [stage, setStage] = useState("Idea Phase");
  const [sector, setSector] = useState("SaaS");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [needs, setNeeds] = useState([]);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const toggleNeed = (item) => {

    if (needs.includes(item)) {
      setNeeds(needs.filter(n => n !== item));
    } else {
      setNeeds([...needs, item]);
    }

  };

  const handlePoster = (e) => {

    const f = e.target.files[0];

    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let posterUrl = preview || "https://images.unsplash.com/photo-1551288049-bebda4e38f71";

    try {
      if (file) {
        setUploading(true);
        const result = await uploadPostImage(file, null, () => { });
        if (result?.url) {
          posterUrl = result.url;
        }
      }

      const descriptionText = `${tagline}\n\nProblem:\n${problem}\n\nSolution:\n${solution}\n\nStage:\n${stage}\n\nSector:\n${sector}`;

      const newStartup = {
        title,
        poster: posterUrl,
        description: descriptionText,
        needs,
        upvotes: 0,
        interested: 0,
        stage,
        sector,
        comments: []
      };

      const result = await addStartup(newStartup, user);

      if (result.success) {
        // Notify connections
        await notifyConnectedAlumni(
          user.uid,
          user.displayName || user.name,
          `New Startup: ${title} - ${tagline}`,
          result.id
        );

        localAddStartup({
          ...newStartup,
          id: result.id,
          founder: user.displayName || user.name || "You"
        });
      } else {
        alert("Failed to post startup. Please try again.");
      }
    } catch (error) {
      console.error("Error posting startup:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (

    <div className="max-w-4xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-bold mb-8">
        Post Startup Idea
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow space-y-6"
      >

        <div>

          <label className="block font-semibold mb-2">
            Startup Name
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />

        </div>

        <div>

          <label className="block font-semibold mb-2">
            Tagline
          </label>

          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full border p-3 rounded"
          />

        </div>

        <div>
          <label className="block font-semibold mb-2">Startup Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option value="">Select stage</option>
            {stages.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Primary Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full border p-3 rounded"
          >
            <option value="">Select sector</option>
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>

          <label className="block font-semibold mb-2">
            Problem
          </label>

          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full border p-3 rounded h-24"
            required
          />

        </div>

        <div>

          <label className="block font-semibold mb-2">
            Solution
          </label>

          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            className="w-full border p-3 rounded h-24"
            required
          />

        </div>

        <div>

          <label className="block font-semibold mb-3">
            What do you need?
          </label>

          <div className="flex gap-6">

            {needsList.map(item => (

              <label
                key={item}
                className="flex items-center gap-2 cursor-pointer"
              >

                <input
                  type="checkbox"
                  checked={needs.includes(item)}
                  onChange={() => toggleNeed(item)}
                />

                {item}

              </label>

            ))}

          </div>

        </div>

        <div>

          <label className="block font-semibold mb-2">
            Startup Poster
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handlePoster}
          />

          {preview && (

            <img
              src={preview}
              className="mt-4 w-60 rounded shadow"
            />

          )}

        </div>

        <div className="flex gap-4">

          <button
            type="submit"
            disabled={uploading}
            className={`bg-purple-600 text-white px-6 py-3 rounded ${uploading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-purple-700'}`}
          >
            {uploading ? 'Uploading...' : 'Post Startup'}
          </button>

          <button
            type="button"
            onClick={goBack}
            className="border px-6 py-3 rounded"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>

  );

};

export default PostStartupPage;
