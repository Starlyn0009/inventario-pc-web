const url = "https://ffiqpbauhfitxyvoebxs.supabase.co/rest/v1/productos?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaXFwYmF1aGZpdHh5dm9lYnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjMwMDksImV4cCI6MjA5MTY5OTAwOX0.uSJ1KDmuTX6HOUvdmqT53s0LEwl0qGWiCsKceEnneQw";

fetch(url, {
  headers: {
    "apikey": key,
    "Authorization": `Bearer ${key}`
  }
})
.then(res => {
  console.log("Status:", res.status);
  return res.text();
})
.then(text => console.log("Response:", text))
.catch(err => console.error("Error:", err));
