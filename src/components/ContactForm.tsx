// Placeholder island. Submission will go to a Cloudflare Worker later.
export default function ContactForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <p>
        <label>
          Name <input name="name" required />
        </label>
      </p>
      <p>
        <label>
          Email <input name="email" type="email" required />
        </label>
      </p>
      <p>
        <label>
          Due date <input name="dueDate" type="date" />
        </label>
      </p>
      <p>
        <label>
          Message <textarea name="message" />
        </label>
      </p>
      <button type="submit">Send (not wired up yet)</button>
    </form>
  );
}
