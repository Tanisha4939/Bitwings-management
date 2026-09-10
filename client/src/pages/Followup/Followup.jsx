import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MessageCircle,
  Paperclip,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import "./Followup.css";


import API_URL from "../../config/api";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const formatWhatsAppNumber = (value) => {
  
  const digits = value.replace(/\D/g, "");
  
  const localNumber = digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;

  
    if (localNumber.length !== 10 || !/^[6-9]\d{9}$/.test(localNumber)) {
    return "";
  }

  return `+91 ${localNumber}`;
};

const Followup = () => {

  const [numberInput, setNumberInput] = useState("");

  const [whatsappNumbers, setWhatsappNumbers] = useState([]);
  
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  
  const [numberError, setNumberError] = useState();
  
  const [image, setImage] = useState(null);
  
  const [imageError, setImageError] = useState("");
  
  const [message, setMessage] = useState("");
  
  const [messageError, setMessageError] = useState("");
  
  const [isSending, setIsSending] = useState(false);
  
  const [sendError, setSendError] = useState("");
  
  const [sendNotice, setSendNotice] = useState("");

  useEffect(() => {
    const loadSavedNumbers = async () => {
      try {
        const response = await fetch(`${API_URL}/marketing`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load saved numbers.");
        }

        const savedNumbers = (data.contacts || [])
          .map((contact) => formatWhatsAppNumber(contact.number))
          .filter(Boolean);

        setWhatsappNumbers(savedNumbers);
      } catch (error) {
        console.error("Saved WhatsApp numbers failed to load:", error);
        setNumberError("Unable to load saved WhatsApp numbers.");
      }
    };

    loadSavedNumbers();
  }, []);

  
  const addNumber = async (event) => {
        event.preventDefault();
        const formattedNumber = formatWhatsAppNumber(numberInput);

        if (!formattedNumber) {
        
          setNumberError("Enter a valid 10-digit WhatsApp number.");

          return;
        }

        try {
          const response = await fetch(`${API_URL}/marketing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number: formattedNumber }),
          });
          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(data.message || "Unable to save this number.");
          }

          setWhatsappNumbers((currentNumbers) => [
            ...currentNumbers,
            formattedNumber,
          ]);
          setNumberInput("");
          setNumberError("");
          setSendError("");
          setSendNotice("WhatsApp number saved successfully.");
        } catch (error) {
          setNumberError(error.message || "Unable to save this number.");
        }
      };

  const handleNumberChange = (event) => {
  
      const sanitizedValue = event.target.value
        .replace(/[^\d+]/g, "")
        .replace(/(?!^)\+/g, "");

    
        setNumberInput(sanitizedValue);
    
        setNumberError("");
    };

 
  const handleImageChange = (event) => {
 
    const selectedFile = event.target.files?.[0];

      if (!selectedFile) return;

      if (!selectedFile.type.startsWith("image/")) {
      
        setImage(null);
        setImageError("Please choose a valid image file.");
        event.target.value = "";
      
      return;
    }

      if (selectedFile.size > MAX_IMAGE_SIZE) {
      
        setImage(null);
        setImageError("Image must be smaller than 5 MB.");
        event.target.value = "";
     
      return;
    }

      setImage({ file: selectedFile, previewUrl: URL.createObjectURL(selectedFile) });
      setImageError("");
      setSendError("");
    };

  const removeImage = () => {
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
      setImage(null);
      setImageError("");
  };

  const handleSendWhatsApp = async (event) => {
      event.preventDefault();
      setSendError("");
      setSendNotice("");

  const trimmedMessage = message.trim();

      if (selectedNumbers.length === 0) {
        setSendError(
          "Select at least one WhatsApp number before sending."
        );
        return;
      }
      if (!trimmedMessage) {
        setMessageError("Message is required.");
        return;
      }

  const formData = new FormData();
  formData.append("whatsappNumbers", JSON.stringify(selectedNumbers));
  formData.append("message", trimmedMessage);

  if (image?.file) {
    formData.append("image", image.file);
  }

  setIsSending(true);

    try {
      const response = await fetch(`${API_URL}/followups/send`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to send the WhatsApp message."
        );
      }

      setSendNotice(data.message || "WhatsApp message sent successfully.");
    } catch (error) {
      console.error("WhatsApp follow-up failed:", error);
      setSendError(error.message || "Unable to send the WhatsApp message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="followup-page">
     
      <div className="followup-header">
     
        <div className="followup-title-wrap">
          <div className="followup-title-icon"><MessageCircle size={25} /></div>
     
          <div>
            <span className="followup-eyebrow">COMMUNICATION</span>
            <h1>Follow-up</h1>
            <p>Prepare a personal WhatsApp follow-up for a student.</p>
          </div>
       
        </div>
       
        <div className="followup-header-badge"><Paperclip size={16} />Optional image</div>
      </div>

      <form className="followup-form" onSubmit={handleSendWhatsApp}>
       
        <div className="followup-sections-container">
        
          {/* SECTION 01: WhatsApp Numbers */}
          <section className="followup-card followup-form-section">
        
            <div className="followup-section-heading followup-compact-heading">
              <div>
                <span className="followup-step">01</span>
                <h2>WhatsApp Numbers</h2>
              </div>
            </div>
            
            <label className="followup-label" htmlFor="whatsapp-number"></label>
           
            <div className="followup-number-entry">
              <input
                id="whatsapp-number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Enter mobile"
                value={numberInput}
                onChange={handleNumberChange}
                aria-invalid={Boolean(numberError)}
              />
              <button className="followup-secondary-button" type="button" onClick={addNumber}>Add</button>
            </div>
           
            {numberError && <p className="followup-field-error">{numberError}</p>}

            {whatsappNumbers.length > 0 && (
           
           <div className="followup-number-list followup-compact-list">

              <label
                className="followup-label"
                htmlFor="selected-number"
              >
                Select recipients
              </label>

              <button
                className="followup-select-all-button"
                type="button"
                onClick={() => {
                  const allSelected = selectedNumbers.length === whatsappNumbers.length;
                  setSelectedNumbers(allSelected ? [] : whatsappNumbers);
                  setSendError("");
                }}
              >
                {selectedNumbers.length === whatsappNumbers.length
                  ? "Deselect all"
                  : "Select all"}
              </button>

              <div className="followup-recipient-list" role="group" aria-label="Select recipients">
                {whatsappNumbers.map((number) => (
                  <label
                    key={number}
                    className={`followup-recipient-option ${selectedNumbers.includes(number) ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      value={number}
                      checked={selectedNumbers.includes(number)}
                      onChange={(event) => {
                        setSelectedNumbers((currentNumbers) =>
                          event.target.checked
                            ? [...currentNumbers, number]
                            : currentNumbers.filter((currentNumber) => currentNumber !== number)
                        );
                        setSendError("");
                      }}
                    />
                    <span>{number}</span>
                  </label>
                ))}
              </div>

              <p className="followup-selected-number">
                {selectedNumbers.length > 0
                  ? `${selectedNumbers.length} selected`
                  : "None selected"}
              </p>

            </div>
          )}
          </section>

          {/* SECTION 02: Image Upload */}
          <section className="followup-card followup-form-section">
           
            <div className="followup-section-heading followup-compact-heading">
           
              <div>
                <span className="followup-step">02</span>
                <h2>Image</h2>
              </div>
           
            </div>
            
            <input id="followup-image" className="followup-file-input" type="file" accept="image/*" onChange={handleImageChange} />
            {!image ? (
              <label className="followup-upload-area followup-compact-upload" htmlFor="followup-image">
                
                <Upload size={22} />
                <strong>Upload</strong>
               
                <span>PNG, JPG, WEBP</span>
              </label>
            ) : (
              <div className="followup-preview-wrap followup-compact-preview">
                <img src={image.previewUrl} alt="Selected follow-up" className="followup-preview" />
                <div className="followup-preview-actions">
               
                  <span>{image.file.name}</span>
               
                  <div>
                    <label className="followup-change-button" htmlFor="followup-image">Change</label>
                    <button className="followup-remove-button" type="button" onClick={removeImage}><Trash2 size={14} />Remove</button>
                  </div>
               
                </div>
              
              </div>
            )}
           
            {imageError && <p className="followup-field-error">{imageError}</p>}
          
          </section>

          {/* SECTION 03: Message */}
          <section className="followup-card followup-form-section">

            <div className="followup-section-heading followup-compact-heading">
   
              <div>
                <span className="followup-step">03</span>
                <h2>Message</h2>
              </div>
   
            </div>
   
            <label className="followup-label" htmlFor="followup-message"></label>
   
            <textarea
              id="followup-message"
              placeholder="Enter your message..."
              value={message}
              onChange={(event) => { setMessage(event.target.value); setMessageError(""); setSendError(""); }}
              aria-invalid={Boolean(messageError)}
              rows={5}
            />
           
             {messageError && <p className="followup-field-error">{messageError}</p>}
          </section>

        </div>

        {(sendError || sendNotice) && (
          <div className={`followup-feedback ${sendNotice ? "success" : "error"}`}>
            {sendNotice ? <CheckCircle2 size={19} /> : <X size={19} />}
            <span>{sendNotice || sendError}</span>
          </div>
        )}

        
        <div className="followup-actions">
        
          <button className="followup-send-button" type="submit" 
            disabled={isSending || selectedNumbers.length === 0 || !message.trim()}>
        
            <Send size={18} />
            {isSending ? "Preparing..." : "Send on WhatsApp"}
        
          </button>
        
        </div>
      
      </form>
    
    </div>
  );
};

export default Followup;