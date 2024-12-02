//Ce middleware vérifie l'authenticité d'un token JWT présent dans l'en-tête d'autorisation, 
//extrait l'ID utilisateur pour l'ajouter à la requête et bloque l'accès si le token est invalide.
const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
    console.log(req.headers.authorization)
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
       console.log(req.auth)
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};