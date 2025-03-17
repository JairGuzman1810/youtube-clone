import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate an Upload Button component for file uploads using UploadThing
export const UploadButton = generateUploadButton<OurFileRouter>();

// Generate an Upload Dropzone component for drag-and-drop file uploads
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
