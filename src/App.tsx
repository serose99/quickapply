import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Link } from "./Link";

function App() {
    const [links, setLinks] = useState<string[]>([]);
    const [copiedLink, setCopiedLink] = useState("");
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        chrome.storage.local.get("links", (results) => {
            if (results.links) {
                setLinks([...results.links]);
            }
        });
        chrome.storage.local.get("darkMode", (results) => {
            setDarkMode(results.darkMode);
            const root = document.querySelector(":root") as HTMLElement;
            if (root) {
                if (results.darkMode) {
                    setDarkModeEffect(root);
                } else {
                    setLightModeEffect(root);
                }
            }
        });
    });

    function setNewLinks(links: string[]) {
        setLinks(links);
        chrome.storage.local.set({ links: links });
    }

    function setNewDarkMode(darkMode: boolean) {
        setDarkMode(darkMode);
        chrome.storage.local.set({ darkMode: darkMode });
    }

    function addLink(): void {
        const newLinks = [...links, ""];
        setNewLinks(newLinks);
    }

    async function copiedCallback(id: number): Promise<void> {
        const url = links[id];
        setCopiedLink(url);
        if ("clipboard" in navigator) {
            await navigator.clipboard.writeText(url);
        } else {
            document.execCommand("copy", true, url);
        }

        const copiedLinkDiv = document.getElementById("copiedLink");
        if (copiedLinkDiv) {
            copiedLinkDiv.style.visibility = "visible";
            setTimeout(() => {
                copiedLinkDiv.style.visibility = "hidden";
            }, 5000);
        }
    }

    function removeCallback(linkId: number): void {
        const newLinks = links.filter((val, index) => {
            return index !== linkId;
        });
        setNewLinks(newLinks);
    }

    function updateCallback(
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) {
        const newLinks = links.map((link, i) => {
            if (i === index) {
                return e.currentTarget.value;
            }
            return link;
        });
        setNewLinks(newLinks);
    }

    const launchCallback = useCallback(
        (linkId: number) => {
            chrome.tabs.create({ url: links[linkId] });
        },
        [links]
    );

    function toggleDarkMode(e: React.MouseEvent<HTMLElement>) {
        const root = document.querySelector(":root") as HTMLElement;
        if (!root) {
            return;
        }
        if (!darkMode) {
            setNewDarkMode(true);
            setDarkModeEffect(root);
        } else {
            setNewDarkMode(false);
            setLightModeEffect(root);
        }
    }

    function setDarkModeEffect(root: HTMLElement) {
        root.style.setProperty("--background", "black");
        root.style.setProperty("--primary", "white");
        root.style.setProperty("--toggle-left", "5px");
    }

    function setLightModeEffect(root: HTMLElement) {
        root.style.setProperty("--background", "white");
        root.style.setProperty("--primary", "black");
        root.style.setProperty("--toggle-left", "25px");
    }

    return (
        <>
            <div className="darkModeContainer" onClick={toggleDarkMode}>
                <div className="darkModeToggle"></div>
            </div>
            <main>
                <div className="header">
                    <h1>Quick Links</h1>
                </div>
                <div>
                    <p id="copiedLink" className="copiedLink">
                        Copied {copiedLink}
                    </p>
                </div>
                <div className="linkList">
                    {links.map((link, index) => {
                        return (
                            <Link
                                key={index}
                                id={index}
                                link={link}
                                copiedCallback={copiedCallback}
                                launchCallback={launchCallback}
                                removeCallback={removeCallback}
                                updateCallback={updateCallback}
                            />
                        );
                    })}
                </div>
                <div className="addContainer">
                    <button className="addButton" onClick={addLink}>
                        Add Link!
                    </button>
                </div>
            </main>
        </>
    );
}

export default App;
