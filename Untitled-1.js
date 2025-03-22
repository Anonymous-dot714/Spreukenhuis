import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button, Input, Card, CardContent } from "@/components/ui";

const supabase = createClient(
  "https://amnuqffbhjtlgkxsxfqr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtbnVxZmZiaGp0bGdreHN4ZnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NDAwODUsImV4cCI6MjA1ODIxNjA4NX0.Rcr-2DN7df6TijF3tq7EwCY72IJrtgRN5gfLwzhagOc"
);

function QuotesPage() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    const { data } = await supabase.from("quotes").select("*").eq("approved", true);
    setQuotes(data);
  }

  return (
    <div className="p-4">
      <h2>Quotes</h2>
      {quotes.map((quote) => (
        <Card key={quote.id}>
          <CardContent>
            <p>{quote.text}</p>
            <p><b>Auteur:</b> {quote.author}</p>
          </CardContent>
        </Card>
      ))}
      <Link to="/submit"><Button>Quote insturen</Button></Link>
    </div>
  );
}

function SubmitQuotePage() {
  const [newQuote, setNewQuote] = useState({
    text: "",
    author: "",
    original: "",
    source: "",
    birthYear: "",
    deathYear: "",
    year: "",
    context: "",
  });

  async function submitQuote() {
    await supabase.from("quotes").insert([{ ...newQuote, approved: false }]);
    setNewQuote({ text: "", author: "", original: "", source: "", birthYear: "", deathYear: "", year: "", context: "" });
  }

  return (
    <div className="p-4">
      <h2>Quote insturen</h2>
      <Input placeholder="Quote" onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })} />
      <Input placeholder="Auteur" onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })} />
      <Button onClick={submitQuote}>Indienen</Button>
    </div>
  );
}

function AdminPage() {
  const [quotes, setQuotes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAdmin) fetchQuotes();
  }, [isAdmin]);

  async function fetchQuotes() {
    const { data } = await supabase.from("quotes").select("*").eq("approved", false);
    setQuotes(data);
  }

  async function approveQuote(id) {
    await supabase.from("quotes").update({ approved: true }).eq("id", id);
    fetchQuotes();
  }

  async function deleteQuote(id) {
    await supabase.from("quotes").delete().eq("id", id);
    fetchQuotes();
  }

  async function login() {
    const { user, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setIsAdmin(true);
  }

  return (
    <div className="p-4">
      {!isAdmin ? (
        <div>
          <h2>Admin Login</h2>
          <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Wachtwoord" onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={login}>Inloggen</Button>
        </div>
      ) : (
        <div>
          <h2>Quotes Beheer</h2>
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardContent>
                <p>{quote.text}</p>
                <p><b>Auteur:</b> {quote.author}</p>
                <Button onClick={() => approveQuote(quote.id)}>Goedkeuren</Button>
                <Button onClick={() => deleteQuote(quote.id)}>Afwijzen</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuotesPage />} />
        <Route path="/submit" element={<SubmitQuotePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
