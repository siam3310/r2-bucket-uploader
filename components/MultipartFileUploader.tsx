import React from "react";
import Uppy, { type UploadResult } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import RemoteSources from "@uppy/remote-sources";

// Uppy styles
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

const fetchUploadApiEndpoint = async (endpoint: string, data: any) => {
  const res = await fetch(`/api/multipart-upload/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    .use(RemoteSources, {
    companionUrl: COMPANION_URL,
    sources: [
      'Box',
      'Dropbox',
      'Facebook',
      'GoogleDrive',
      'Instagram',
      'OneDrive',
      'Unsplash',
      'Url',
    ],
    companionAllowedHosts,
  })
  .use(Webcam, {
    target: Dashboard,
    showVideoSourceDropdown: true,
    showRecordingLength: true,
  })
  .use(Audio, {
    target: Dashboard,
    showRecordingLength: true,
  })
  .use(ScreenCapture, { target: Dashboard })
  .use(ImageEditor, { target: Dashboard })
  .use(DropTarget, {
    target: document.body,
  })
  .use(Compressor);
  });

  return res.json();
};

export function MultipartFileUploader({
  onUploadSuccess,
}: {
  onUploadSuccess: (result: UploadResult) => void;
}) {
  const uppy = React.useMemo(() => {
    const uppy = new Uppy({
      autoProceed: true,
    }).use(AwsS3Multipart,Url, {
      createMultipartUpload: async (file) => {
        const contentType = file.type;
        return fetchUploadApiEndpoint("create-multipart-upload", {
          file,
          contentType,
        });
      },
      listParts: (file, props) =>
        fetchUploadApiEndpoint("list-parts", { file, ...props }),
      signPart: (file, props) =>
        fetchUploadApiEndpoint("sign-part", { file, ...props }),
      abortMultipartUpload: (file, props) =>
        fetchUploadApiEndpoint("abort-multipart-upload", { file, ...props }),
      completeMultipartUpload: (file, props) =>
        fetchUploadApiEndpoint("complete-multipart-upload", { file, ...props }),
    });
    return uppy;
  }, []);
  uppy.on("complete", (result) => {
    onUploadSuccess(result);
  });
  uppy.on("upload-success", (file, response) => {
    uppy.setFileState(file.id, {
      progress: uppy.getState().files[file.id].progress,
      uploadURL: response.body.Location,
      response: response,
      isPaused: false,
    });
  });

  return <Dashboard uppy={uppy} showLinkToFileUploadResult={true} />;
}


  
