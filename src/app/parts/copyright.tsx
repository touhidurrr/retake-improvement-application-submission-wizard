export function Copyright() {
  return (
    <div className="text-center text-sm text-gray-500">
      © {new Date().getFullYear()}{" "}
      <a
        href="https://github.com/touhidurrr"
        className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        Md. Touhidur Rahman
      </a>
      . All rights reserved.{" "}
      <a
        href="https://github.com/touhidurrr/retake-improvement-application-submission-wizard"
        className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
      .
      <br />
      Team:{" "}
      <a
        href="https://github.com/touhidurrr"
        className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        Md. Touhidur Rahman
      </a>
      {", "}
      <a
        href="https://github.com/mrhbijoy"
        className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        Md. Rakibul Hasan Bijoy
      </a>
    </div>
  );
}
