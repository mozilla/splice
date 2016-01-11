package main

import (
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/x509"
	"encoding/asn1"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strings"
)

var PrivateKey string = "MIGkAgEBBDAzX2TrGOr0WE92AbAl+nqnpqh25pKCLYNMTV2hJHztrkVPWOp8w0mhscIodK8RMpagBwYFK4EEACKhZANiAATiTcWYbt0Wg63dO7OXvpptNG0ryxv+v+JsJJ5Upr3pFus5fZyKxzP9NPzB+oFhL/xw3jMx7X5/vBGaQ2sJSiNlHVkqZgzYF6JQ4yUyiqTY7v67CyfUPA1BJg/nxOS9m3o="

var kHost string = "127.0.0.1:8000"

type ecdsaSignature struct {
	R, S *big.Int
}

type SignedContent struct {
	B64asn1 string
	B64url  string
}

type Content struct {
	Content string
}

func main() {
	http.HandleFunc("/sign", handler)
	fmt.Println(fmt.Sprintf("Listening on http://%s...", kHost))
	http.ListenAndServe(kHost, nil)
}

func handler(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var content Content
	err := decoder.Decode(&content)
	if err != nil {
		panic(err)
	}
	ecdsaSig, err := sign(PrivateKey, []byte(content.Content))
	if err != nil {
		panic(err)
	}
	sigAsn1Bytes, err := asn1.Marshal(ecdsaSignature{ecdsaSig.R, ecdsaSig.S})
	if err != nil {
		panic(err)
	}
	sigWebCryptoBytes := make([]byte, len(ecdsaSig.R.Bytes())+len(ecdsaSig.S.Bytes()))
	copy(sigWebCryptoBytes[:len(ecdsaSig.R.Bytes())], ecdsaSig.R.Bytes())
	copy(sigWebCryptoBytes[len(ecdsaSig.R.Bytes()):], ecdsaSig.S.Bytes())
	strASN1 := fmt.Sprintf("keyid=1;p256ecdsa=%s", base64.StdEncoding.EncodeToString(sigAsn1Bytes))
	strB64URL := fmt.Sprintf("keyid=1;p256ecdsa=%s", encode(sigAsn1Bytes))
	signedContent := SignedContent{strASN1, strB64URL}

	output, _ := json.Marshal(signedContent)
	fmt.Println("Signing content with signature:", strASN1[:30], "...")
	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func sign(privateKey string, hash []byte) (*ecdsaSignature, error) {
	privKey, err := x509.ParseECPrivateKey(decode(PrivateKey))
	if err != nil {
		return nil, err
	}
	ecdsaSig := new(ecdsaSignature)
	ecdsaSig.R, ecdsaSig.S, err = ecdsa.Sign(rand.Reader, privKey, hash)
	return ecdsaSig, err
}

func b64urlTob64(s string) string {
	// convert base64url characters back to regular base64 alphabet
	s = strings.Replace(s, "-", "+", -1)
	s = strings.Replace(s, "_", "/", -1)
	if l := len(s) % 4; l > 0 {
		s += strings.Repeat("=", 4-l)
	}
	return s
}

func decode(s string) []byte {
	b, err := base64.StdEncoding.DecodeString(b64urlTob64(s))
	if err != nil {
		panic(err)
	}
	return b
}

func b64Tob64url(s string) string {
	// convert base64url characters back to regular base64 alphabet
	s = strings.Replace(s, "+", "-", -1)
	s = strings.Replace(s, "/", "_", -1)
	s = strings.TrimRight(s, "=")
	return s
}

func encode(b []byte) string {
	return b64Tob64url(base64.StdEncoding.EncodeToString(b))
}
