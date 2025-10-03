import { useState, type ChangeEvent, type MouseEvent } from 'react'
import axios from 'axios'

export async function uploadJsonToIPFS(metadata: unknown): Promise<string> {
  const res = await axios({
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    data: metadata,
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
      pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
    },
  });
  const hash = res.data.IpfsHash as string;
  return hash;
}

function UploadToIPFS() {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(picked);
  }

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!file) {
      alert('Please select a file first!')
      return
    }
    
    console.log(file);
    // console.log('API Key:', import.meta.env.VITE_PINATA_API_KEY);
    // console.log('Secret Key:', import.meta.env.VITE_PINATA_SECRET_API_KEY);

    try {
      setUploading(true)
      
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Make request to Pinata API
      const responseData = await axios({
        method: "post",
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
        }
      })
      
      const url = `https://gateway.pinata.cloud/ipfs/${responseData.data.IpfsHash}`
      setFileUrl(url)
      setUploading(false)
      
      console.log('File uploaded:', url)
    } catch (err : unknown) {
      console.error('Error uploading file:', err)
      setUploading(false); 
    }
  }

  return (
    <>
      <h1>IPFS Tutorial</h1>
      <input type="file" onChange={handleFileChange} />
      <button 
        type="button" 
        onClick={handleSubmit}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {fileUrl && (
        <div>
          <p>File uploaded successfully!</p>
          <a href={fileUrl} target="_blank" rel="noreferrer">
            View File
          </a>
        </div>
      )}
    </>
  )
}

export default UploadToIPFS;
