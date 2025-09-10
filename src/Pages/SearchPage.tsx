import React, { useState, useEffect } from "react";
import TextBox from "../components/TextBox";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StreamChat } from "stream-chat";
import SpecPicker from "../components/SpecPicker";
import JudetPicker from "../components/JudetPicker";
import { off } from "process";

function SearchPageTest() {
  const [judet, setJudet] = useState("");
  const [spec, setSpec] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  interface Office {
    office_id: number;
    office_nume: string;
    oras: string;
    judet: string;
    adresa: string;
    tel: string;
    doctor_id: string;
    doctor_nume: string;
    doctor_prenume: string;
    doctor_spec: string;
    doctor_bio: string;
    profile_picture: string;
  }

  const getSpecLabel = (code: string): string => {
    switch (code) {
      case "KIN":
        return "Kinetoterapie";
      case "FAM":
        return "Medicină de Familie";
      case "DEN":
        return "Medicină Dentară";
      case "DRM":
        return "Dermatologie";
      case "OFT":
        return "Oftalmologie";
      case "ORL":
        return "ORL";
      case "PSI":
        return "Psihologie";
      case "NEU":
        return "Neurologie";
      case "PED":
        return "Pediatrie";
      case "CRD":
        return "Cardiologie";
      case "GIN":
        return "Ginecologie";
      default:
        return "N/A";
    }
  };

  const handleLogout = () => {
    axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [results, setResults] = useState<Office[]>([]);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      console.log("handleSearch triggered");
      const response = await axios.get("http://localhost:5000/fetchOffices", {
        params: {
          q: query,
          judet: judet || undefined,
          spec: spec || undefined,
        },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleResetFilters = () => {
    setJudet("");
    setSpec("");
  };

  useEffect(() => {
    handleSearch();
  }, [spec, judet]);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <img
            src="src/assets/Minerva2.png"
            alt="Company Logo"
            className="logo"
          />
          <span className="logo-text">MinervaMed</span>
        </div>
        <div className="header-center">
          <Button
            width="80px"
            variant="filled-alt"
            onClick={() => navigate("/main2")}
            color="blue"
            selected={location.pathname === "/tconfirmation"}
          >
            Home
          </Button>
          <Button
            variant="filled-alt"
            onClick={() => navigate("/appointments_reg")}
            color="blue"
          >
            Appointments
          </Button>
          <Button
            width="80px"
            variant="filled-alt"
            onClick={() => navigate("/rsplitchats")}
            color="blue"
          >
            Chat
          </Button>
          <Button
            width="110px"
            variant="filled-alt"
            selected={location.pathname === "/search"}
            onClick={() => navigate("/search")}
            color="blue"
          >
            Search
          </Button>
        </div>
        <div className="header-right">
          <Button
            width="80px"
            variant="filled-alt"
            onClick={handleLogout}
            color="blue"
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="search-section">
        <div className="search-container">
          <div className="search-wrapper">
            <div className="search-bar">
              <TextBox
                value={query}
                onChange={setQuery}
                placeholder="Search"
                className="form-control search-input"
              />
              <Button
                onClick={handleSearch}
                color="primary"
                variant="regular"
                className="search-button"
                icon="src/assets/search.png"
              />
            </div>

            <div className="filters-toggle">
              <Button
                width="100px"
                color="gray"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="filters-button"
              >
                Filtre
              </Button>

              {filtersOpen && (
                <div className="filters-panel">
                  <SpecPicker
                    value={spec}
                    onOptionSelect={(value) => {
                      setSpec(value);
                      handleSearch();
                    }}
                  />
                  <JudetPicker
                    value={judet}
                    onOptionSelect={(value) => {
                      setJudet(value);
                      handleSearch();
                    }}
                  />
                  <Button
                    width="160px"
                    onClick={handleResetFilters}
                    color="secondary"
                  >
                    Resetare Filtre
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="results-container">
        {Array.isArray(results) && results.length > 0 ? (
          <div className="result-grid">
            {results.map((office) => (
              <div key={office.doctor_id} className="result-card">
                <div className="card-row">
                  <img
                    src={
                      office.profile_picture
                        ? `http://localhost:5000/uploads/${office.profile_picture}`
                        : "src/assets/placeholder.png"
                    }
                    alt="Doctor"
                    className="result-avatar"
                  />

                  <div className="card-content" style={{ flex: 1 }}>
                    <div className="result-header">
                      <div className="office-name">
                        Dr. {office.doctor_nume} {office.doctor_prenume}
                      </div>
                      <span className="office-id">{office.office_nume}</span>
                    </div>

                    <div className="office-location">
                      {getSpecLabel((office.doctor_spec || "").toUpperCase())} –
                      {office.doctor_bio}
                    </div>

                    <hr className="result-divider" />

                    <div className="result-footer">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div className="office-location">
                          {office.adresa}, {office.oras}, {office.judet}
                        </div>
                        <Button
                          width="80px"
                          onClick={() =>
                            navigate(`/doctor-about/${office.doctor_id}`)
                          }
                          color="blue"
                        >
                          Detalii
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Niciun rezultat găsit.</p>
        )}
      </div>
    </>
  );
}

export default SearchPageTest;
